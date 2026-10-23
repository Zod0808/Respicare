import React, { memo } from 'react';
import { List } from 'react-window';

function Row({ index, style, items, renderItem }) {
  const item = items[index];
  if (!item) {
    return null;
  }
  return (
    <div style={style}>
      {renderItem(item, index)}
    </div>
  );
}

function VirtualizedList({
  items,
  itemHeight,
  maxVisibleItems = 6,
  overscanCount = 3,
  renderItem,
  className = ''
}) {
  if (!items || items.length === 0) {
    return null;
  }

  const containerHeight = Math.min(items.length, maxVisibleItems) * itemHeight || itemHeight;

  return (
    <div
      className={`virtualized-list ${className}`}
      style={{ height: containerHeight }}
    >
      <List
        style={{ height: '100%' }}
        rowComponent={Row}
        rowCount={items.length}
        rowHeight={itemHeight}
        rowProps={{ items, renderItem }}
        overscanCount={overscanCount}
      />
    </div>
  );
}

export default memo(VirtualizedList);

