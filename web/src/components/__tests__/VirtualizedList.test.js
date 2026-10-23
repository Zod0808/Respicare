import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VirtualizedList from '../VirtualizedList';

jest.mock('react-window', () => ({
  List: ({ rowComponent: RowComponent, rowCount, rowProps, style }) => (
    <div data-testid="mock-react-window" data-height={style?.height}>
      {Array.from({ length: rowCount }).map((_, index) => (
        <RowComponent key={index} index={index} style={{ top: index * 10 }} {...rowProps} />
      ))}
    </div>
  ),
}));

describe('VirtualizedList', () => {
  it('retorna null cuando no hay elementos', () => {
    const { container } = render(
      <VirtualizedList items={[]} itemHeight={50} renderItem={() => null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza la lista virtualizada con los elementos proporcionados', () => {
    const renderItem = jest.fn((item) => <div data-testid="item">{item.label}</div>);
    const items = [
      { id: 1, label: 'Zona A' },
      { id: 2, label: 'Zona B' },
      { id: 3, label: 'Zona C' },
      { id: 4, label: 'Zona D' },
    ];

    const { container } = render(
      <VirtualizedList
        items={items}
        itemHeight={40}
        maxVisibleItems={3}
        renderItem={renderItem}
      />
    );

    expect(screen.getByTestId('mock-react-window')).toHaveAttribute('data-height', '100%');
    expect(renderItem).toHaveBeenCalledTimes(items.length);
    expect(screen.getAllByTestId('item')).toHaveLength(items.length);
    expect(container.firstChild).toHaveClass('virtualized-list');
    expect(container.firstChild).toHaveStyle({ height: `${3 * 40}px` });
  });
});

