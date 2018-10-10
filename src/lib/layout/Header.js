import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TimelineElementsHeader from './TimelineElementsHeader'

import moment from 'moment'

class Header extends Component {
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
    stickyOffset: PropTypes.number,
    stickyHeader: PropTypes.bool.isRequired,
    headerLabelGroupHeight: PropTypes.number.isRequired,
    headerLabelHeight: PropTypes.number.isRequired,
    registerScroll: PropTypes.func.isRequired,
    leftSidebarHeader: PropTypes.node,
    rightSidebarHeader: PropTypes.node,
    headerRef: PropTypes.func.isRequired,
    groups: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    updateScrollCanvas: PropTypes.func.isRequired,
    onTimeChange: PropTypes.func.isRequired,
    handleWheelZoom: PropTypes.func.isRequired
  }

  render() {
    const {
      leftSidebarHeader,
      rightSidebarHeader,
      width,
      stickyOffset,
      stickyHeader,
      headerRef,
      hasRightSidebar,
      showPeriod,
      daySelected,
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      minUnit,
      timeSteps,
      headerLabelFormats,
      subHeaderLabelFormats,
      headerLabelGroupHeight,
      headerLabelHeight,
      registerScroll,
      groups
    } = this.props

    const headerStyle = {
      top: stickyHeader ? stickyOffset || 0 : 0
    }

    const controlStyle = {
      position: 'absolute',
      top: '70px',
      height: '25px',
      width: '25px',
      color: '#3D454A',
      backgroundColor: '#ffffff',
      border: '1px solid #CBDCE4',
      zIndex: 200,
      cursor: 'pointer',
      borderRadius: '3px',
      textAlign: 'center',
      lineHeight: '13px'
    }

    const headerClass = stickyHeader ? 'header-sticky' : ''

    return (
      <div
        className={`rct-header-container ${headerClass}`}
        data-testid="timeline-elements-container"
        ref={headerRef}
        style={headerStyle}
      >
        <button
          type='button'
          style={{...controlStyle, width: '60px', right: '70px', bottom: '10px', fontSize: '12px'}}
          onClick={() => {
            this.props.onTimeChange(
              moment().subtract(15, 'days').valueOf(),
              moment().add(15, 'days').valueOf(),
              this.props.updateScrollCanvas
            )
          }}>Today</button>
        <button
          type='button'
          style={{...controlStyle, right: '40px', bottom: '10px'}}
          onClick={e => {
            e.preventDefault()
            this.props.handleWheelZoom(10, 562, 10)
          }}>-</button>
        <button
          type='button'
          style={{...controlStyle, right: '10px', bottom: '10px'}}
          onClick={e => {
            e.preventDefault()
            this.props.handleWheelZoom(10, 562, -10)
          }}>+</button>
        {leftSidebarHeader}
        <div style={{ width }} data-testid="timeline-elements-header-container">
          <TimelineElementsHeader
            data-testid="timeline-elements-header"
            hasRightSidebar={hasRightSidebar}
            showPeriod={showPeriod}
            daySelected={daySelected}
            canvasTimeStart={canvasTimeStart}
            canvasTimeEnd={canvasTimeEnd}
            canvasWidth={canvasWidth}
            minUnit={minUnit}
            timeSteps={timeSteps}
            width={width}
            groups={groups}
            headerLabelFormats={headerLabelFormats}
            subHeaderLabelFormats={subHeaderLabelFormats}
            headerLabelGroupHeight={headerLabelGroupHeight}
            headerLabelHeight={headerLabelHeight}
            registerScroll={registerScroll}
          />
        </div>
        {rightSidebarHeader}
      </div>
    )
  }
}

export default Header
