import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TimelineElementsHeader from './TimelineElementsHeader'

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

    const headerClass = stickyHeader ? 'header-sticky' : ''

    return (
      <div
        className={`rct-header-container ${headerClass}`}
        data-testid="timeline-elements-container"
        ref={headerRef}
        style={headerStyle}
      >
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
