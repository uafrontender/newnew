import React from 'react';

interface IListItem {
  item: {
    key: string,
  };
}

export const ListItem: React.FC<IListItem> = (props) => {
  const { item } = props;

  return (
    <div>
      {item.key}
    </div>
  );
};

export default ListItem;
