import React from 'react'
import PropTypes from 'prop-types'

export const defaultItemRenderer = ({
  item,
  itemContext,
  getItemProps,
  getResizeProps
}) => {
  const { left: leftResizeProps, right: rightResizeProps } = getResizeProps()

  let itemProps = getItemProps(item.itemProps)
  if (itemContext.selected) {
    itemProps.style = {
      ...itemProps.style,
      border: `1px solid ${item.color}`,
      background: 'transparent',
      color: '#333333',
      borderRadius: '3px',
    }
  } else {
    itemProps.style = {
      ...itemProps.style,
      backgroundColor: item.color,
      background: item.color,
      border: `1px solid ${item.color}`,
      borderRadius: '3px',
    }
  }
  return (
    <div {...itemProps}>
      {itemContext.useResizeHandle ? <div {...leftResizeProps} /> : ''}

      <div
        className="rct-item-content"
        style={{
          maxHeight: `${itemContext.dimensions.height}`,
        }}
      >
        {itemContext.title}
      </div>

      {itemContext.useResizeHandle ? <div {...rightResizeProps} /> : ''}
    </div>
  )
}

// TODO: update this to actual prop types. Too much to change before release
// future me, forgive me.
defaultItemRenderer.propTypes = {
  item: PropTypes.any,
  itemContext: PropTypes.any,
  getItemProps: PropTypes.any,
  getResizeProps: PropTypes.any
}
