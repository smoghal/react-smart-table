import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'semantic-ui-react';

class TableHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: '',
      direction: null
    };
    this.onSortByColumnClicked = this.onSortByColumnClicked.bind(this);
  }

  onSortByColumnClicked(clickedColumn) {
    console.log('TableHeader.onSortByColumnClicked(). column clicked: ', clickedColumn);

    const { sortBy, direction } = this.state;
    let newDirection = null;

    if (sortBy === clickedColumn) {
      newDirection = direction === 'ascending' ? 'descending' : 'ascending';
    } else {
      newDirection = 'ascending';
    }

    this.setState({
      sortBy: clickedColumn,
      direction: newDirection
    });

    this.props.sortByHandler(clickedColumn, newDirection);
  }

  getRandomKey() {
    const currTime = new Date().getTime();

    return Math.floor(Math.random() * Math.floor(currTime));
  }

  render() {
    const { columnData } = this.props;
    const tableHeader =
      columnData
        .filter(column => column.visible)
        .map(column =>
          <Table.HeaderCell
            key={this.getRandomKey()}
            sorted={this.state.sortBy === column.key ? this.state.direction : null}
            onClick={() => this.onSortByColumnClicked(column.key)}>
            {column.name}
          </Table.HeaderCell>
        );

    // console.log('TableHeader.render() tableHeader', tableHeader);

    return (
      <Table.Header fullWidth>
        <Table.Row>
          {tableHeader}
        </Table.Row>
      </Table.Header>
    );
  }
}

TableHeader.propTypes = {
  sortByHandler: PropTypes.func.isRequired,
  columnData: PropTypes.arrayOf(PropTypes.object)
};

export default TableHeader;
