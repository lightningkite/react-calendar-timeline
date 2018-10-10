import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'

import Items from './items/Items'
import InfoLabel from './layout/InfoLabel'
import Sidebar from './layout/Sidebar'
import Header from './layout/Header'
import Columns from './columns/Columns'
import GroupRows from './row/GroupRows'
import ScrollElement from './scroll/ScrollElement'
import MarkerCanvas from './markers/MarkerCanvas'
import Style from 'style-it'

import windowResizeDetector from '../resize-detector/window'

import {
  getMinUnit,
  getNextUnit,
  stack,
  nostack,
  calculateDimensions,
  getGroupOrders,
  getVisibleItems,
  calculateTimeForXPosition
} from './utility/calendar'
import { _get, _length } from './utility/generic'
import {
  defaultKeys,
  defaultTimeSteps,
  defaultHeaderLabelFormats,
  defaultSubHeaderLabelFormats
} from './default-config'
import { TimelineStateProvider } from './timeline/TimelineStateContext'
import { TimelineMarkersProvider } from './markers/TimelineMarkersContext'

export default class ReactCalendarTimeline extends Component {
  static propTypes = {
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    items: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
    sidebarWidth: PropTypes.number,
    sidebarContent: PropTypes.node,
    rightSidebarWidth: PropTypes.number,
    rightSidebarContent: PropTypes.node,
    dragSnap: PropTypes.number,
    minResizeWidth: PropTypes.number,
    stickyOffset: PropTypes.number,
    stickyHeader: PropTypes.bool,
    lineHeight: PropTypes.number,
    headerLabelGroupHeight: PropTypes.number,
    headerLabelHeight: PropTypes.number,
    itemHeightRatio: PropTypes.number,

    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,

    clickTolerance: PropTypes.number,

    canChangeGroup: PropTypes.bool,
    canMove: PropTypes.bool,
    canResize: PropTypes.oneOf([true, false, 'left', 'right', 'both']),
    useResizeHandle: PropTypes.bool,
    canSelect: PropTypes.bool,

    stackItems: PropTypes.bool,

    traditionalZoom: PropTypes.bool,

    itemTouchSendsClick: PropTypes.bool,

    horizontalLineClassNamesForGroup: PropTypes.func,

    onItemMove: PropTypes.func,
    onItemResize: PropTypes.func,
    onItemClick: PropTypes.func,
    onItemSelect: PropTypes.func,
    onItemDeselect: PropTypes.func,
    onCanvasClick: PropTypes.func,
    onItemDoubleClick: PropTypes.func,
    onItemContextMenu: PropTypes.func,
    onCanvasDoubleClick: PropTypes.func,
    onCanvasContextMenu: PropTypes.func,
    onZoom: PropTypes.func,
    daySelected: PropTypes.func,

    moveResizeValidator: PropTypes.func,

    itemRenderer: PropTypes.func,
    groupRenderer: PropTypes.func,

    style: PropTypes.object,

    keys: PropTypes.shape({
      groupIdKey: PropTypes.string,
      groupTitleKey: PropTypes.string,
      groupRightTitleKey: PropTypes.string,
      itemIdKey: PropTypes.string,
      itemTitleKey: PropTypes.string,
      itemDivTitleKey: PropTypes.string,
      itemGroupKey: PropTypes.string,
      itemTimeStartKey: PropTypes.string,
      itemTimeEndKey: PropTypes.string
    }),
    headerRef: PropTypes.func,
    scrollRef: PropTypes.func,

    timeSteps: PropTypes.shape({
      second: PropTypes.number,
      minute: PropTypes.number,
      hour: PropTypes.number,
      day: PropTypes.number,
      month: PropTypes.number,
      year: PropTypes.number
    }),

    defaultTimeStart: PropTypes.object,
    defaultTimeEnd: PropTypes.object,

    visibleTimeStart: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    visibleTimeEnd: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
    onTimeChange: PropTypes.func,
    onBoundsChange: PropTypes.func,

    selected: PropTypes.array,

    headerLabelFormats: PropTypes.shape({
      yearShort: PropTypes.string,
      yearLong: PropTypes.string,
      monthShort: PropTypes.string,
      monthMedium: PropTypes.string,
      monthMediumLong: PropTypes.string,
      monthLong: PropTypes.string,
      dayShort: PropTypes.string,
      dayLong: PropTypes.string,
      hourShort: PropTypes.string,
      hourMedium: PropTypes.string,
      hourMediumLong: PropTypes.string,
      hourLong: PropTypes.string
    }),

    subHeaderLabelFormats: PropTypes.shape({
      yearShort: PropTypes.string,
      yearLong: PropTypes.string,
      monthShort: PropTypes.string,
      monthMedium: PropTypes.string,
      monthLong: PropTypes.string,
      dayShort: PropTypes.string,
      dayMedium: PropTypes.string,
      dayMediumLong: PropTypes.string,
      dayLong: PropTypes.string,
      hourShort: PropTypes.string,
      hourLong: PropTypes.string,
      minuteShort: PropTypes.string,
      minuteLong: PropTypes.string
    }),

    resizeDetector: PropTypes.shape({
      addListener: PropTypes.func,
      removeListener: PropTypes.func
    }),

    verticalLineClassNamesForTime: PropTypes.func,

    children: PropTypes.node
  }

  static defaultProps = {
    sidebarWidth: 150,
    rightSidebarWidth: 0,
    dragSnap: 1000 * 60 * 15, // 15min
    minResizeWidth: 20,
    stickyOffset: 0,
    stickyHeader: true,
    lineHeight: 30,
    headerLabelGroupHeight: 30,
    headerLabelHeight: 30,
    itemHeightRatio: 0.65,

    minZoom: 60 * 60 * 1000, // 1 hour
    maxZoom: 5 * 365.24 * 86400 * 1000, // 5 years

    clickTolerance: 3, // how many pixels can we drag for it to be still considered a click?

    canChangeGroup: true,
    canMove: true,
    canResize: 'right',
    useResizeHandle: false,
    canSelect: true,

    stackItems: false,

    traditionalZoom: false,

    horizontalLineClassNamesForGroup: null,

    onItemMove: null,
    onItemResize: null,
    onItemClick: null,
    onItemSelect: null,
    onItemDeselect: null,
    onCanvasClick: null,
    onItemDoubleClick: null,
    onItemContextMenu: null,
    onZoom: null,

    verticalLineClassNamesForTime: null,

    moveResizeValidator: null,

    dayBackground: null,

    defaultTimeStart: null,
    defaultTimeEnd: null,

    itemTouchSendsClick: false,

    style: {},
    keys: defaultKeys,
    timeSteps: defaultTimeSteps,
    headerRef: () => {},
    scrollRef: () => {},

    // if you pass in visibleTimeStart and visibleTimeEnd, you must also pass onTimeChange(visibleTimeStart, visibleTimeEnd),
    // which needs to update the props visibleTimeStart and visibleTimeEnd to the ones passed
    visibleTimeStart: null,
    visibleTimeEnd: null,
    onTimeChange: function(
      visibleTimeStart,
      visibleTimeEnd,
      updateScrollCanvas
    ) {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
    },
    // called when the canvas area of the calendar changes
    onBoundsChange: null,
    children: null,

    headerLabelFormats: defaultHeaderLabelFormats,
    subHeaderLabelFormats: defaultSubHeaderLabelFormats,

    selected: null
  }

  static childContextTypes = {
    getTimelineContext: PropTypes.func
  }

  getChildContext() {
    return {
      getTimelineContext: () => {
        return this.getTimelineContext()
      }
    }
  }

  getTimelineContext = () => {
    const {
      width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart
    } = this.state
    const zoom = visibleTimeEnd - visibleTimeStart
    const canvasTimeEnd = canvasTimeStart + zoom * 3

    return {
      timelineWidth: width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd
    }
  }

  constructor(props) {
    super(props)

    let visibleTimeStart = null
    let visibleTimeEnd = null

    if (this.props.defaultTimeStart && this.props.defaultTimeEnd) {
      visibleTimeStart = this.props.defaultTimeStart.valueOf()
      visibleTimeEnd = this.props.defaultTimeEnd.valueOf()
    } else if (this.props.visibleTimeStart && this.props.visibleTimeEnd) {
      visibleTimeStart = this.props.visibleTimeStart
      visibleTimeEnd = this.props.visibleTimeEnd
    } else {
      //throwing an error because neither default or visible time props provided
      throw new Error(
        'You must provide either "defaultTimeStart" and "defaultTimeEnd" or "visibleTimeStart" and "visibleTimeEnd" to initialize the Timeline'
      )
    }

    this.state = {
      width: 1000,

      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      canvasTimeStart: visibleTimeStart - (visibleTimeEnd - visibleTimeStart),

      selectedItem: null,
      dragTime: null,
      dragGroupTitle: null,
      resizeTime: null,
      topOffset: 0,
      resizingItem: null,
      resizingEdge: null
    }

    const { dimensionItems, height, groupHeights, groupTops } = this.stackItems(
      props.items,
      props.groups,
      this.state.canvasTimeStart,
      this.state.visibleTimeStart,
      this.state.visibleTimeEnd,
      this.state.width
    )

    /* eslint-disable react/no-direct-mutation-state */
    this.state.dimensionItems = dimensionItems
    this.state.height = height
    this.state.groupHeights = groupHeights
    this.state.groupTops = groupTops

    /* eslint-enable */
  }

  componentDidMount() {
    this.resize(this.props)

    if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
      this.props.resizeDetector.addListener(this)
    }

    windowResizeDetector.addListener(this)

    this.lastTouchDistance = null
  }

  componentWillUnmount() {
    if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
      this.props.resizeDetector.removeListener(this)
    }

    windowResizeDetector.removeListener(this)
  }

  resize = (props = this.props) => {
    const {
      width: containerWidth,
      top: containerTop
    } = this.container.getBoundingClientRect()

    let width = containerWidth - props.sidebarWidth - props.rightSidebarWidth
    const { headerLabelGroupHeight, headerLabelHeight } = props
    const headerHeight = headerLabelGroupHeight + headerLabelHeight

    const { dimensionItems, height, groupHeights, groupTops } = this.stackItems(
      props.items,
      props.groups,
      this.state.canvasTimeStart,
      this.state.visibleTimeStart,
      this.state.visibleTimeEnd,
      width
    )

    // this is needed by dragItem since it uses pageY from the drag events
    // if this was in the context of the scrollElement, this would not be necessary
    const topOffset = containerTop + window.pageYOffset + headerHeight

    this.setState({
      width,
      topOffset,
      dimensionItems,
      height,
      groupHeights,
      groupTops
    })
    this.scrollComponent.scrollLeft = width
  }

  // FIXME: this function calls set state EVERY TIME YOU SCROLL
  onScroll = scrollX => {
    const canvasTimeStart = this.state.canvasTimeStart

    const zoom = this.state.visibleTimeEnd - this.state.visibleTimeStart
    const width = this.state.width
    const visibleTimeStart = canvasTimeStart + zoom * scrollX / width

    if (scrollX < this.state.width * 0.5) {
      this.setState({
        canvasTimeStart: this.state.canvasTimeStart - zoom
      })
    }
    if (scrollX > this.state.width * 1.5) {
      this.setState({
        canvasTimeStart: this.state.canvasTimeStart + zoom
      })
    }

    if (
      this.state.visibleTimeStart !== visibleTimeStart ||
      this.state.visibleTimeEnd !== visibleTimeStart + zoom
    ) {
      this.props.onTimeChange(
        visibleTimeStart,
        visibleTimeStart + zoom,
        this.updateScrollCanvas
      )
    }

    this.setState({
      currentScrollLeft: scrollX
    })
  }

  componentWillReceiveProps(nextProps) {
    const {
      visibleTimeStart,
      visibleTimeEnd,
      items,
      groups,
      sidebarWidth
    } = nextProps

    if (visibleTimeStart && visibleTimeEnd) {
      this.updateScrollCanvas(
        visibleTimeStart,
        visibleTimeEnd,
        items !== this.props.items || groups !== this.props.groups,
        items,
        groups
      )
    } else if (items !== this.props.items || groups !== this.props.groups) {
      this.updateDimensions(items, groups)
    }

    // resize if the sidebar width changed
    if (sidebarWidth !== this.props.sidebarWidth && items && groups) {
      this.resize(nextProps)
    }
  }

  updateDimensions(items, groups) {
    const {
      canvasTimeStart,
      visibleTimeStart,
      visibleTimeEnd,
      width
    } = this.state
    const { dimensionItems, height, groupHeights, groupTops } = this.stackItems(
      items,
      groups,
      canvasTimeStart,
      visibleTimeStart,
      visibleTimeEnd,
      width
    )

    this.setState({ dimensionItems, height, groupHeights, groupTops })
  }

  // called when the visible time changes
  updateScrollCanvas = (
    visibleTimeStart,
    visibleTimeEnd,
    forceUpdateDimensions,
    updatedItems,
    updatedGroups
  ) => {
    const oldCanvasTimeStart = this.state.canvasTimeStart
    const oldZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart
    const newZoom = visibleTimeEnd - visibleTimeStart
    const items = updatedItems || this.props.items
    const groups = updatedGroups || this.props.groups

    let newState = {
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd
    }

    let resetCanvas = false

    const canKeepCanvas =
      visibleTimeStart >= oldCanvasTimeStart + oldZoom * 0.5 &&
      visibleTimeStart <= oldCanvasTimeStart + oldZoom * 1.5 &&
      visibleTimeEnd >= oldCanvasTimeStart + oldZoom * 1.5 &&
      visibleTimeEnd <= oldCanvasTimeStart + oldZoom * 2.5

    // if new visible time is in the right canvas area
    if (canKeepCanvas) {
      // but we need to update the scroll
      const newScrollLeft = Math.round(
        this.state.width * (visibleTimeStart - oldCanvasTimeStart) / newZoom
      )
      if (this.scrollComponent.scrollLeft !== newScrollLeft) {
        resetCanvas = true
      }
    } else {
      resetCanvas = true
    }

    if (resetCanvas) {
      newState.canvasTimeStart = visibleTimeStart - newZoom
      this.scrollComponent.scrollLeft = this.state.width

      if (this.props.onBoundsChange) {
        this.props.onBoundsChange(
          newState.canvasTimeStart,
          newState.canvasTimeStart + newZoom * 3
        )
      }
    }

    if (resetCanvas || forceUpdateDimensions) {
      const canvasTimeStart = newState.canvasTimeStart
        ? newState.canvasTimeStart
        : oldCanvasTimeStart
      const {
        dimensionItems,
        height,
        groupHeights,
        groupTops
      } = this.stackItems(
        items,
        groups,
        canvasTimeStart,
        visibleTimeStart,
        visibleTimeEnd,
        this.state.width
      )
      newState.dimensionItems = dimensionItems
      newState.height = height
      newState.groupHeights = groupHeights
      newState.groupTops = groupTops
    }

    this.setState(newState, () => {
      // are we changing zoom? Well then let's report it
      // need to wait until state is set so that we get current
      // timeline context
      if (this.props.onZoom && oldZoom !== newZoom) {
        this.props.onZoom(this.getTimelineContext())
      }
    })
  }

  handleWheelZoom = (speed, xPosition, deltaY) => {
    this.changeZoom(1.0 + speed * deltaY / 500, xPosition / this.state.width)
  }

  changeZoom = (scale, offset = 0.5) => {
    const { minZoom, maxZoom } = this.props
    const oldZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart
    const newZoom = Math.min(
      Math.max(Math.round(oldZoom * scale), minZoom),
      maxZoom
    ) // min 1 min, max 20 years
    const newVisibleTimeStart = Math.round(
      this.state.visibleTimeStart + (oldZoom - newZoom) * offset
    )

    this.props.onTimeChange(
      newVisibleTimeStart,
      newVisibleTimeStart + newZoom,
      this.updateScrollCanvas
    )
  }

  showPeriod = (from, unit) => {
    let visibleTimeStart = from.valueOf()
    let visibleTimeEnd = moment(from)
      .add(1, unit)
      .valueOf()
    let zoom = visibleTimeEnd - visibleTimeStart

    // can't zoom in more than to show one hour
    if (zoom < 360000) {
      return
    }

    // clicked on the big header and already focused here, zoom out
    if (
      unit !== 'year' &&
      this.state.visibleTimeStart === visibleTimeStart &&
      this.state.visibleTimeEnd === visibleTimeEnd
    ) {
      let nextUnit = getNextUnit(unit)

      visibleTimeStart = from.startOf(nextUnit).valueOf()
      visibleTimeEnd = moment(visibleTimeStart).add(1, nextUnit)
      zoom = visibleTimeEnd - visibleTimeStart
    }

    this.props.onTimeChange(
      visibleTimeStart,
      visibleTimeStart + zoom,
      this.updateScrollCanvas
    )
  }

  daySelected = (time) => {
    if (this.props.daySelected) {
      this.props.daySelected(time)
    }
  }

  selectItem = (item, clickType, e, itemObj) => {
    if (
      this.state.selectedItem === item ||
      (this.props.itemTouchSendsClick && clickType === 'touch')
    ) {
      if (item && this.props.onItemClick) {
        const time = this.timeFromItemEvent(e)
        this.props.onItemClick(item, e, time, itemObj)
      }
    } else {
      this.setState({ selectedItem: item })
      if (item && this.props.onItemSelect) {
        const time = this.timeFromItemEvent(e)
        this.props.onItemSelect(item, e, time)
      } else if (item === null && this.props.onItemDeselect) {
        this.props.onItemDeselect(e) // this isnt in the docs. Is this function even used?
      }
    }
  }

  doubleClickItem = (item, e) => {
    if (this.props.onItemDoubleClick) {
      const time = this.timeFromItemEvent(e)
      this.props.onItemDoubleClick(item, e, time)
    }
  }

  contextMenuClickItem = (item, e) => {
    if (this.props.onItemContextMenu) {
      const time = this.timeFromItemEvent(e)
      this.props.onItemContextMenu(item, e, time)
    }
  }

  // TODO: this is very similar to timeFromItemEvent, aside from which element to get offsets
  // from.  Look to consolidate the logic for determining coordinate to time
  // as well as generalizing how we get time from click on the canvas
  getTimeFromRowClickEvent = e => {
    const { dragSnap } = this.props
    const {
      width,
      canvasTimeStart,
      visibleTimeStart,
      visibleTimeEnd
    } = this.state
    // this gives us distance from left of row element, so event is in
    // context of the row element, not client or page
    const { offsetX } = e.nativeEvent

    // FIXME: DRY up way to calculate canvasTimeEnd
    const zoom = visibleTimeEnd - visibleTimeStart
    const canvasTimeEnd = zoom * 3 + canvasTimeStart

    let time = calculateTimeForXPosition(
      canvasTimeStart,
      canvasTimeEnd,
      width * 3,
      offsetX
    )
    time = Math.floor(time / dragSnap) * dragSnap

    return time
  }

  timeFromItemEvent = e => {
    const { width, visibleTimeStart, visibleTimeEnd } = this.state
    const { dragSnap } = this.props

    const scrollComponent = this.scrollComponent
    const { left: scrollX } = scrollComponent.getBoundingClientRect()

    const xRelativeToTimeline = e.clientX - scrollX

    const relativeItemPosition = xRelativeToTimeline / width
    const zoom = visibleTimeEnd - visibleTimeStart
    const timeOffset = relativeItemPosition * zoom

    let time = Math.round(visibleTimeStart + timeOffset)
    time = Math.floor(time / dragSnap) * dragSnap

    return time
  }

  dragItem = (item, dragTime, newGroupOrder) => {
    let newGroup = this.props.groups[newGroupOrder]
    const keys = this.props.keys

    this.setState({
      draggingItem: item,
      dragTime: dragTime,
      newGroupOrder: newGroupOrder,
      dragGroupTitle: newGroup ? _get(newGroup, keys.groupTitleKey) : ''
    })
  }

  dropItem = (item, dragTime, newGroupOrder, itemObj) => {
    this.setState({ draggingItem: null, dragTime: null, dragGroupTitle: null })
    if (this.props.onItemMove) {
      this.props.onItemMove(item, dragTime, newGroupOrder, itemObj)
    }
  }

  resizingItem = (item, resizeTime, edge) => {
    this.setState({
      resizingItem: item,
      resizingEdge: edge,
      resizeTime: resizeTime
    })
  }

  resizedItem = (item, resizeTime, edge, timeDelta, itemObj) => {
    this.setState({ resizingItem: null, resizingEdge: null, resizeTime: null })
    if (this.props.onItemResize && timeDelta !== 0) {
      this.props.onItemResize(item, resizeTime, edge, itemObj)
    }
  }

  columns(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    minUnit,
    timeSteps,
    height
  ) {
    return (
      <Columns
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        lineCount={_length(this.props.groups)}
        minUnit={minUnit}
        timeSteps={timeSteps}
        height={height}
        verticalLineClassNamesForTime={this.props.verticalLineClassNamesForTime}
      />
    )
  }

  handleRowClick = (e, rowIndex) => {
    // shouldnt this be handled by the user, as far as when to deselect an item?
    if (this.state.selectedItem) {
      this.selectItem(null)
    }

    if (this.props.onCanvasClick == null) return

    const time = this.getTimeFromRowClickEvent(e)
    let groupId = null
    if (rowIndex) {
      groupId = _get(
        this.props.groups[rowIndex],
        this.props.keys.groupIdKey
      )
    }

    this.props.onCanvasClick(groupId, time, e)
  }

  handleRowDoubleClick = (e, rowIndex) => {
    if (this.props.onCanvasDoubleClick == null) return

    const time = this.getTimeFromRowClickEvent(e)
    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey
    )
    this.props.onCanvasDoubleClick(groupId, time, e)
  }

  handleScrollContextMenu = (e, rowIndex) => {
    if (this.props.onCanvasContextMenu == null) return

    const timePosition = this.getTimeFromRowClickEvent(e)

    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey
    )

    if (this.props.onCanvasContextMenu) {
      e.preventDefault()
      this.props.onCanvasContextMenu(groupId, timePosition, e)
    }
  }

  rows(canvasWidth, groupHeights, groups) {
    return (
      <GroupRows
        groups={groups}
        canvasWidth={canvasWidth}
        lineCount={_length(this.props.groups)}
        groupHeights={groupHeights}
        clickTolerance={this.props.clickTolerance}
        onRowClick={this.handleRowClick}
        onRowDoubleClick={this.handleRowDoubleClick}
        horizontalLineClassNamesForGroup={this.props.horizontalLineClassNamesForGroup}
        onRowContextClick={this.handleScrollContextMenu}
      />
    )
  }

  items(
    canvasTimeStart,
    zoom,
    canvasTimeEnd,
    canvasWidth,
    minUnit,
    dimensionItems,
    groupHeights,
    groupTops
  ) {
    return (
      <Items
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        dimensionItems={dimensionItems}
        groupTops={groupTops}
        items={this.props.items}
        groups={this.props.groups}
        keys={this.props.keys}
        selectedItem={this.state.selectedItem}
        dragSnap={this.props.dragSnap}
        minResizeWidth={this.props.minResizeWidth}
        canChangeGroup={this.props.canChangeGroup}
        canMove={this.props.canMove}
        canResize={this.props.canResize}
        useResizeHandle={this.props.useResizeHandle}
        canSelect={this.props.canSelect}
        moveResizeValidator={this.props.moveResizeValidator}
        topOffset={this.state.topOffset}
        itemSelect={this.selectItem}
        itemDrag={this.dragItem}
        itemDrop={this.dropItem}
        onItemDoubleClick={this.doubleClickItem}
        onItemContextMenu={this.contextMenuClickItem}
        itemResizing={this.resizingItem}
        itemResized={this.resizedItem}
        itemRenderer={this.props.itemRenderer}
        selected={this.props.selected}
      />
    )
  }

  infoLabel() {
    let label = null

    if (this.state.dragTime) {
      label = `${moment(this.state.dragTime).format('LLL')}, ${
        this.state.dragGroupTitle
      }`
    } else if (this.state.resizeTime) {
      label = moment(this.state.resizeTime).format('LLL')
    }

    return label ? <InfoLabel label={label} /> : ''
  }

  header(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    minUnit,
    timeSteps,
    headerLabelGroupHeight,
    headerLabelHeight
  ) {
    const { sidebarWidth, rightSidebarWidth } = this.props
    const leftSidebar = sidebarWidth != null &&
      sidebarWidth > 0 && (
        <div
          className="rct-sidebar-header"
          style={{ width: this.props.sidebarWidth }}
        >
          {this.props.sidebarContent}
        </div>
      )

    const rightSidebar = rightSidebarWidth != null &&
      rightSidebarWidth > 0 && (
        <div
          className="rct-sidebar-header rct-sidebar-right"
          style={{ width: this.props.rightSidebarWidth }}
        >
          {this.props.rightSidebarContent}
        </div>
      )

    return (
      <Header
        groups={this.props.groups}
        canvasTimeStart={canvasTimeStart}
        hasRightSidebar={this.props.rightSidebarWidth > 0}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        minUnit={minUnit}
        timeSteps={timeSteps}
        headerLabelGroupHeight={headerLabelGroupHeight}
        headerLabelHeight={headerLabelHeight}
        width={this.state.width}
        stickyOffset={this.props.stickyOffset}
        stickyHeader={this.props.stickyHeader}
        showPeriod={this.showPeriod}
        daySelected={this.daySelected}
        headerLabelFormats={this.props.headerLabelFormats}
        subHeaderLabelFormats={this.props.subHeaderLabelFormats}
        registerScroll={this.registerScrollListener}
        leftSidebarHeader={leftSidebar}
        rightSidebarHeader={rightSidebar}
        headerRef={this.props.headerRef}
        updateScrollCanvas={this.updateScrollCanvas}
        onTimeChange={this.props.onTimeChange}
        handleWheelZoom={this.handleWheelZoom}
      />
    )
  }

  componentDidUpdate() {
    this.headerScrollListener(this.state.currentScrollLeft)
  }

  registerScrollListener = listener => {
    this.headerScrollListener = listener
  }

  sidebar(height, groupHeights) {
    const { sidebarWidth } = this.props
    return (
      sidebarWidth != null &&
      sidebarWidth > 0 && (
        <Sidebar
          groups={this.props.groups}
          groupRenderer={this.props.groupRenderer}
          keys={this.props.keys}
          width={this.props.sidebarWidth}
          groupHeights={groupHeights}
          height={height}
        />
      )
    )
  }

  rightSidebar(height, groupHeights) {
    const { rightSidebarWidth } = this.props

    return (
      rightSidebarWidth != null &&
      rightSidebarWidth > 0 && (
        <Sidebar
          groups={this.props.groups}
          keys={this.props.keys}
          groupRenderer={this.props.groupRenderer}
          isRightSidebar
          width={this.props.rightSidebarWidth}
          groupHeights={groupHeights}
          height={height}
        />
      )
    )
  }

  stackItems(
    items,
    allGroups,
    canvasTimeStart,
    visibleTimeStart,
    visibleTimeEnd,
    width
  ) {
    const groups = allGroups.slice(0, 1)
    // if there are no groups return an empty array of dimensions
    if (groups.length === 0) {
      return {
        dimensionItems: [],
        height: 0,
        groupHeights: [],
        groupTops: []
      }
    }

    const { keys, lineHeight, stackItems, itemHeightRatio } = this.props
    const {
      draggingItem,
      dragTime,
      resizingItem,
      resizingEdge,
      resizeTime,
      newGroupOrder
    } = this.state
    const zoom = visibleTimeEnd - visibleTimeStart
    const canvasTimeEnd = canvasTimeStart + zoom * 3
    const canvasWidth = width * 3

    const visibleItems = getVisibleItems(
      items,
      canvasTimeStart,
      canvasTimeEnd,
      keys
    )
    const groupOrders = getGroupOrders(groups, keys)

    let dimensionItems = visibleItems.reduce((memo, item) => {
      const itemId = _get(item, keys.itemIdKey)
      const isDragging = itemId === draggingItem
      const isResizing = itemId === resizingItem

      let dimension = calculateDimensions({
        itemTimeStart: _get(item, keys.itemTimeStartKey),
        itemTimeEnd: _get(item, keys.itemTimeEndKey),
        isDragging,
        isResizing,
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth,
        dragTime,
        resizingEdge,
        resizeTime
      })

      if (dimension) {
        dimension.top = null
        dimension.order = isDragging
          ? newGroupOrder
          : groupOrders[_get(item, keys.itemGroupKey)]
        dimension.stack = !item.isOverlay
        dimension.height = lineHeight * itemHeightRatio
        dimension.isDragging = isDragging

        memo.push({
          id: itemId,
          dimensions: dimension
        })
      }

      return memo
    }, [])

    const stackingMethod = stackItems ? stack : nostack

    const { height, groupHeights, groupTops } = stackingMethod(
      dimensionItems,
      groupOrders,
      lineHeight,
      groups
    )

    return { dimensionItems, height, groupHeights, groupTops }
  }

  childrenWithProps(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    dimensionItems,
    groupHeights,
    groupTops,
    height,
    headerHeight,
    visibleTimeStart,
    visibleTimeEnd,
    minUnit,
    timeSteps
  ) {
    if (!this.props.children) {
      return null
    }

    // convert to an array and remove the nulls
    const childArray = Array.isArray(this.props.children)
      ? this.props.children.filter(c => c)
      : [this.props.children]

    const childProps = {
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      dimensionItems,
      items: this.props.items,
      groups: this.props.groups,
      keys: this.props.keys,
      groupHeights: groupHeights,
      groupTops: groupTops,
      selected:
        this.state.selectedItem && !this.props.selected
          ? [this.state.selectedItem]
          : this.props.selected || [],
      height: height,
      headerHeight: headerHeight,
      minUnit: minUnit,
      timeSteps: timeSteps
    }

    return React.Children.map(childArray, child =>
      React.cloneElement(child, childProps)
    )
  }

  render() {
    const {
      items,
      groups,
      headerLabelGroupHeight,
      headerLabelHeight,
      sidebarWidth,
      rightSidebarWidth,
      timeSteps,
      traditionalZoom
    } = this.props
    const {
      draggingItem,
      resizingItem,
      width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart
    } = this.state
    let { dimensionItems, height, groupHeights, groupTops } = this.state

    const zoom = visibleTimeEnd - visibleTimeStart
    const canvasTimeEnd = canvasTimeStart + zoom * 3
    const canvasWidth = width * 3
    const minUnit = getMinUnit(zoom, width, timeSteps)
    const headerHeight = headerLabelGroupHeight + headerLabelHeight

    const isInteractingWithItem = !!draggingItem || !!resizingItem

    if (isInteractingWithItem) {
      const stackResults = this.stackItems(
        items,
        groups,
        canvasTimeStart,
        visibleTimeStart,
        visibleTimeEnd,
        width
      )
      dimensionItems = stackResults.dimensionItems
      height = stackResults.height
      groupHeights = stackResults.groupHeights
      groupTops = stackResults.groupTops
    }

    const outerComponentStyle = {
      height: `${height}px`,
      position: 'relative'
    }

    return (
      <TimelineStateProvider
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
      >
        <TimelineMarkersProvider>
          <div
            style={this.props.style}
            ref={el => (this.container = el)}
            className="react-calendar-timeline"
          >
            {this.header(
              canvasTimeStart,
              canvasTimeEnd,
              canvasWidth,
              minUnit,
              timeSteps,
              headerLabelGroupHeight,
              headerLabelHeight
            )}
            {items.length === 0 && groups.length > 0 &&
              <Style>
                {`
                  .tooltip-timeline {
                      position:relative;
                      z-index: 100;
                  }
                  .tooltip-timeline::before {
                      content: "";
                      position: absolute;
                      top: 100px;
                      left: 50%;
                      transform: translateX(-50%);
                      border-width: 4px 6px 0 6px;
                      border-style: solid;
                      border-color: #F3D900 transparent transparent transparent;
                      z-index: 100;
                  }
                  .tooltip-timeline::after {
                      content: "Click on timeline to add tasks";
                      text-overflow: ellipsis;
                      overflow: hidden;
                      position: absolute;
                      height: 25px;
                      line-height: 25px;
                      left: 50%;
                      top: 100px;
                      transform: translateX(-50%) translateY(-100%);
                      background: #F3D900;
                      text-align: center;
                      color: #fff;
                      padding: 4px 2px 2px 0px;
                      font-size: 12px;
                      font-weight: bold;
                      min-width: 80px;
                      width: 200px;
                      border-radius: 5px;
                      pointer-events: none;
                      z-index: 100;
                  }
                `}
              </Style>
            }
            <div
              style={outerComponentStyle}
              className={`rct-outer${items.length === 0 && groups.length > 0 ? ' tooltip-timeline' : ''}`}
            >
              {sidebarWidth > 0 ? this.sidebar(height, groupHeights) : null}
              <ScrollElement
                scrollRef={el => {
                  this.props.scrollRef(el);
                  this.scrollComponent = el
                }}
                width={width}
                height={height}
                onZoom={this.changeZoom}
                onWheelZoom={this.handleWheelZoom}
                traditionalZoom={traditionalZoom}
                onScroll={this.onScroll}
                isInteractingWithItem={isInteractingWithItem}
              >
                <MarkerCanvas>
                  {this.items(
                    canvasTimeStart,
                    zoom,
                    canvasTimeEnd,
                    canvasWidth,
                    minUnit,
                    dimensionItems,
                    groupHeights,
                    groupTops
                  )}
                  {this.columns(
                    canvasTimeStart,
                    canvasTimeEnd,
                    canvasWidth,
                    minUnit,
                    timeSteps,
                    height,
                    headerHeight
                  )}
                  {this.rows(canvasWidth, groupHeights, groups)}
                  {this.infoLabel()}
                  {this.childrenWithProps(
                    canvasTimeStart,
                    canvasTimeEnd,
                    canvasWidth,
                    dimensionItems,
                    groupHeights,
                    groupTops,
                    height,
                    headerHeight,
                    visibleTimeStart,
                    visibleTimeEnd,
                    minUnit,
                    timeSteps
                  )}
                </MarkerCanvas>
              </ScrollElement>
              {rightSidebarWidth > 0
                ? this.rightSidebar(height, groupHeights)
                : null}
            </div>
          </div>
        </TimelineMarkersProvider>
      </TimelineStateProvider>
    )
  }
}
