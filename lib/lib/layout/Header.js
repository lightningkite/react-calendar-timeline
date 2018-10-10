'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _TimelineElementsHeader = require('./TimelineElementsHeader');

var _TimelineElementsHeader2 = _interopRequireDefault(_TimelineElementsHeader);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Header = function (_Component) {
  _inherits(Header, _Component);

  function Header() {
    _classCallCheck(this, Header);

    return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
  }

  _createClass(Header, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          leftSidebarHeader = _props.leftSidebarHeader,
          rightSidebarHeader = _props.rightSidebarHeader,
          width = _props.width,
          stickyOffset = _props.stickyOffset,
          stickyHeader = _props.stickyHeader,
          headerRef = _props.headerRef,
          hasRightSidebar = _props.hasRightSidebar,
          showPeriod = _props.showPeriod,
          daySelected = _props.daySelected,
          canvasTimeStart = _props.canvasTimeStart,
          canvasTimeEnd = _props.canvasTimeEnd,
          canvasWidth = _props.canvasWidth,
          minUnit = _props.minUnit,
          timeSteps = _props.timeSteps,
          headerLabelFormats = _props.headerLabelFormats,
          subHeaderLabelFormats = _props.subHeaderLabelFormats,
          headerLabelGroupHeight = _props.headerLabelGroupHeight,
          headerLabelHeight = _props.headerLabelHeight,
          registerScroll = _props.registerScroll,
          groups = _props.groups;


      var headerStyle = {
        top: stickyHeader ? stickyOffset || 0 : 0
      };

      var controlStyle = {
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
      };

      var headerClass = stickyHeader ? 'header-sticky' : '';

      return _react2.default.createElement(
        'div',
        {
          className: 'rct-header-container ' + headerClass,

          ref: headerRef,
          style: headerStyle
        },
        _react2.default.createElement(
          'button',
          {
            type: 'button',
            style: _extends({}, controlStyle, { width: '60px', right: '70px', bottom: '10px', fontSize: '12px' }),
            onClick: function onClick() {
              _this2.props.onTimeChange((0, _moment2.default)().subtract(15, 'days').valueOf(), (0, _moment2.default)().add(15, 'days').valueOf(), _this2.props.updateScrollCanvas);
            } },
          'Today'
        ),
        _react2.default.createElement(
          'button',
          {
            type: 'button',
            style: _extends({}, controlStyle, { right: '40px', bottom: '10px' }),
            onClick: function onClick(e) {
              e.preventDefault();
              _this2.props.handleWheelZoom(10, 562, 10);
            } },
          '-'
        ),
        _react2.default.createElement(
          'button',
          {
            type: 'button',
            style: _extends({}, controlStyle, { right: '10px', bottom: '10px' }),
            onClick: function onClick(e) {
              e.preventDefault();
              _this2.props.handleWheelZoom(10, 562, -10);
            } },
          '+'
        ),
        leftSidebarHeader,
        _react2.default.createElement(
          'div',
          { style: { width: width } },
          _react2.default.createElement(_TimelineElementsHeader2.default, {
            hasRightSidebar: hasRightSidebar,
            showPeriod: showPeriod,
            daySelected: daySelected,
            canvasTimeStart: canvasTimeStart,
            canvasTimeEnd: canvasTimeEnd,
            canvasWidth: canvasWidth,
            minUnit: minUnit,
            timeSteps: timeSteps,
            width: width,
            groups: groups,
            headerLabelFormats: headerLabelFormats,
            subHeaderLabelFormats: subHeaderLabelFormats,
            headerLabelGroupHeight: headerLabelGroupHeight,
            headerLabelHeight: headerLabelHeight,
            registerScroll: registerScroll
          })
        ),
        rightSidebarHeader
      );
    }
  }]);

  return Header;
}(_react.Component);

Header.propTypes = {
  hasRightSidebar: _propTypes2.default.bool.isRequired,
  showPeriod: _propTypes2.default.func.isRequired,
  daySelected: _propTypes2.default.func.isRequired,
  canvasTimeStart: _propTypes2.default.number.isRequired,
  canvasTimeEnd: _propTypes2.default.number.isRequired,
  canvasWidth: _propTypes2.default.number.isRequired,
  minUnit: _propTypes2.default.string.isRequired,
  timeSteps: _propTypes2.default.object.isRequired,
  width: _propTypes2.default.number.isRequired,
  headerLabelFormats: _propTypes2.default.object.isRequired,
  subHeaderLabelFormats: _propTypes2.default.object.isRequired,
  stickyOffset: _propTypes2.default.number,
  stickyHeader: _propTypes2.default.bool.isRequired,
  headerLabelGroupHeight: _propTypes2.default.number.isRequired,
  headerLabelHeight: _propTypes2.default.number.isRequired,
  registerScroll: _propTypes2.default.func.isRequired,
  leftSidebarHeader: _propTypes2.default.node,
  rightSidebarHeader: _propTypes2.default.node,
  headerRef: _propTypes2.default.func.isRequired,
  groups: _propTypes2.default.oneOfType([_propTypes2.default.array, _propTypes2.default.object]),
  updateScrollCanvas: _propTypes2.default.func.isRequired,
  onTimeChange: _propTypes2.default.func.isRequired,
  handleWheelZoom: _propTypes2.default.func.isRequired
};
exports.default = Header;