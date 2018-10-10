import PropTypes from 'prop-types'
import React, { Component } from 'react'
import moment from 'moment'

import { iterateTimes, getNextUnit } from '../utility/calendar'

export default class TimelineElementsHeader extends Component {
  static propTypes = {
    hasRightSidebar: PropTypes.bool.isRequired,
    showPeriod: PropTypes.func.isRequired,
    daySelected: PropTypes.func.isRequired,
    canvasTimeStart: PropTypes.number.isRequired,
    canvasTimeEnd: PropTypes.number.isRequired,
    canvasWidth: PropTypes.number.isRequired,
    minUnit: PropTypes.string.isRequired,
    timeSteps: PropTypes.object.isRequired,
    width: PropTypes.number.isRequired,
    headerLabelFormats: PropTypes.object.isRequired,
    subHeaderLabelFormats: PropTypes.object.isRequired,
    headerLabelGroupHeight: PropTypes.number.isRequired,
    headerLabelHeight: PropTypes.number.isRequired,
    registerScroll: PropTypes.func.isRequired,
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
  };

  constructor(props) {
    super(props)

    props.registerScroll(scrollX => {
      if (scrollX != null) {
        this.headerEl.scrollLeft = scrollX
      }
    })
    this.state = {
      touchTarget: null,
      touchActive: false
    }
  }

  handleHeaderMouseDown(evt) {
    //dont bubble so that we prevent our scroll component
    //from knowing about it
    evt.stopPropagation()
  }

  headerLabel(time, unit, width) {
    const { headerLabelFormats: f } = this.props

    if (unit === 'year') {
      return time.format(width < 46 ? f.yearShort : f.yearLong)
    } else if (unit === 'month') {
      return time.format(
        width < 65
          ? f.monthShort
          : width < 75
            ? f.monthMedium
            : width < 120 ? f.monthMediumLong : f.monthLong
      )
    } else if (unit === 'day') {
      return time.format(width < 150 ? f.dayShort : f.dayLong)
    } else if (unit === 'hour') {
      return time.format(
        width < 50
          ? f.hourShort
          : width < 130
            ? f.hourMedium
            : width < 150 ? f.hourMediumLong : f.hourLong
      )
    } else {
      return time.format(f.time)
    }
  }

  subHeaderLabel(time, unit, width) {
    const { subHeaderLabelFormats: f } = this.props

    if (unit === 'year') {
      return time.format(width < 46 ? f.yearShort : f.yearLong)
    } else if (unit === 'month') {
      return time.format(
        width < 37 ? f.monthShort : width < 85 ? f.monthMedium : f.monthLong
      )
    } else if (unit === 'day') {
      return time.format(
        width < 47
          ? f.dayShort
          : width < 80 ? f.dayMedium : width < 120 ? f.dayMediumLong : f.dayLong
      )
    } else if (unit === 'hour') {
      return time.format(width < 50 ? f.hourShort : f.hourLong)
    } else if (unit === 'minute') {
      return time.format(width < 60 ? f.minuteShort : f.minuteLong)
    } else {
      return time.get(unit)
    }
  }

  handlePeriodClick = (time, unit) => {
    if (time && unit && unit !== 'day') {
      this.props.showPeriod(moment(time - 0), unit)
    } else if (time && unit && unit === 'day') {
      this.props.daySelected(moment(time - 0))
    }
  }

  shouldComponentUpdate(nextProps) {
    const willUpate =
      nextProps.canvasTimeStart != this.props.canvasTimeStart ||
      nextProps.canvasTimeEnd != this.props.canvasTimeEnd ||
      nextProps.width != this.props.width ||
      nextProps.canvasWidth != this.props.canvasWidth ||
      nextProps.subHeaderLabelFormats != this.props.subHeaderLabelFormats ||
      nextProps.headerLabelFormats != this.props.headerLabelFormats ||
      nextProps.groups != this.props.groups

    return willUpate
  }

  render() {
    const {
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      minUnit,
      timeSteps,
      headerLabelGroupHeight,
      headerLabelHeight,
      hasRightSidebar,
      groups
    } = this.props

    const ratio = canvasWidth / (canvasTimeEnd - canvasTimeStart)
    const twoHeaders = minUnit !== 'year'

    const topHeaderLabels = []
    // add the top header
    if (twoHeaders) {
      const nextUnit = getNextUnit(minUnit)

      iterateTimes(
        canvasTimeStart,
        canvasTimeEnd,
        nextUnit,
        timeSteps,
        (time, nextTime) => {
          const left = Math.round((time.valueOf() - canvasTimeStart) * ratio)
          const right = Math.round(
            (nextTime.valueOf() - canvasTimeStart) * ratio
          )

          const labelWidth = right - left
          // this width applies to the content in the header
          // it simulates stickyness where the content is fixed in the center
          // of the label.  when the labelWidth is less than visible time range,
          // have label content fill the entire width
          const contentWidth = Math.min(labelWidth, canvasWidth / 3)

          topHeaderLabels.push(

              <div
                key={`top-label-${time.valueOf()}`}
                className={`rct-label-group${
                  hasRightSidebar ? ' rct-has-right-sidebar' : ''
                }`}
                style={{
                  left: `${left - 1}px`,
                  width: `${labelWidth}px`,
                  height: `${headerLabelGroupHeight}px`,
                  lineHeight: `${headerLabelGroupHeight}px`,
                  pointerEvents: 'none',
                }}
              >
                <span style={{ width: contentWidth, display: 'block' }}>
                  {this.headerLabel(time, nextUnit, labelWidth)}
                </span>
              </div>
          )
        }
      )
    }

    const bottomHeaderLabels = []
    const tomorrowString = moment().add(1, 'days').format('YYYY-MM-DD')
    const todayString = moment().format('YYYY-MM-DD')
    iterateTimes(
      canvasTimeStart,
      canvasTimeEnd,
      minUnit,
      timeSteps,
      (time, nextTime) => {
        const left = Math.round((time.valueOf() - canvasTimeStart) * ratio)
        const minUnitValue = time.get(minUnit === 'day' ? 'date' : minUnit)
        const firstOfType = minUnitValue === (minUnit === 'day' ? 1 : 0)
        const labelWidth = Math.round(
          (nextTime.valueOf() - time.valueOf()) * ratio
        )
        const leftCorrect = firstOfType ? 1 : 0

        let group = groups.filter(group => group.date === time.format('YYYY-MM-DD'))
        let color = '#333333'
        let tooltipColor = '#333333'
        let fontWeight = 'normal'
        let title = ''
        let displayTooltip
        if (group.length > 0 && minUnit === 'day') {
          group = group[0]
          color = group.color
          tooltipColor = group.color
          title = group.title
          fontWeight = 'bold'
          displayTooltip = true
        } else if (time.format('YYYY-MM-DD') === tomorrowString) {
          color = '#3D454A'
          if (groups.length === 0) {
            displayTooltip = true
            tooltipColor = '#F3D900'
            title = 'Click a day to add milestones'
          }
        } else if (time.format('YYYY-MM-DD') === todayString) {
          fontWeight = 'bold'
        }
        bottomHeaderLabels.push(
          <div
            key={`label-${time.valueOf()}`}
            className={`rct-label ${twoHeaders ? '' : 'rct-label-only'} ${
              firstOfType ? 'rct-first-of-type' : ''
            } ${
              minUnit !== 'month' ? `rct-day-${time.day()}` : ''
            }`}
            onClick={() => this.handlePeriodClick(time, minUnit)}
            style={{
              left: `${left - leftCorrect}px`,
              width: `${labelWidth}px`,
              height: `${
                minUnit === 'year'
                  ? headerLabelGroupHeight + headerLabelHeight
                  : headerLabelHeight
              }px`,
              lineHeight: `${
                minUnit === 'year'
                  ? headerLabelGroupHeight + headerLabelHeight
                  : headerLabelHeight
              }px`,
              fontSize: `${
                labelWidth > 30 ? '14' : labelWidth > 20 ? '12' : '10'
              }px`,
              cursor: 'pointer',
              color: color,
              fontWeight: fontWeight
            }}
          >
            {displayTooltip &&
              <div
                style={{fontWeight: 'bold', backgroundColor: tooltipColor, width: `${title.length * 8 + 10}px`}}
                className='tooltip'
                onClick={() => {
                  this.handlePeriodClick(time, minUnit)
                }
              }>
                {title}
              </div>
            }
            {displayTooltip &&
              <div
                style={{borderColor: `${tooltipColor} transparent transparent transparent`}}
                className='tooltip-arrow'
                onClick={() => this.handlePeriodClick(time, minUnit)}></div>
            }
            {this.subHeaderLabel(time, minUnit, labelWidth)}
          </div>
        )
      }
    )

    let headerStyle = {
      height: `${headerLabelGroupHeight + headerLabelHeight}px`
    }

    return (
      <div
        key="header"
        data-testid="header"
        className="rct-header"
        onMouseDown={this.handleHeaderMouseDown}
        onTouchStart={this.touchStart}
        onTouchEnd={this.touchEnd}
        style={headerStyle}
        ref={el => (this.headerEl = el)}
      >
        <div
          className="top-header"
          style={{ height: twoHeaders ? headerLabelGroupHeight : 0, width: canvasWidth }}
        >
          {topHeaderLabels}
        </div>
        <div
          className="bottom-header"
          style={{ height: twoHeaders ? headerLabelHeight : headerLabelHeight + headerLabelGroupHeight, width: canvasWidth }}
        >
          {bottomHeaderLabels}
        </div>
      </div>
    )
  }
}
