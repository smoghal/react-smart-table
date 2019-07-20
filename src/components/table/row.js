import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Icon, Button, Modal, Header, TextArea, Form } from 'semantic-ui-react';

class TableRow extends Component {
  constructor(props) {
    super(props);
    this.renderCell = this.renderCell.bind(this);
    this.renderCells = this.renderCells.bind(this);
    this.handleRowClicked = this.handleRowClicked.bind(this);
    this.handlePrimaryAction = this.handlePrimaryAction.bind(this);
    this.onParamChange = this.onParamChange.bind(this);
    this.handleModalOpen = this.handleModalOpen.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.state = {
      rowHighlight: typeof this.props.rowHighlight === 'undefined' | this.props.rowHighlight === null ? null : this.props.rowHighlight,
      primaryActionParams: '',
      modalOpen: false
    };
  };

  componentWillReceiveProps(newProps) {
    this.setState({
      rowHighlight: newProps.rowHighlight
    });
  }

  isBoolean(val) {
    return typeof val === 'boolean';
  }

  getRandomKey(rowId) {
    const currTime = new Date().getTime();
    const key = `${rowId}-${Math.floor(Math.random() * Math.floor(currTime))}`;

    return key;
  }

  onParamChange(event, data) {
    this.setState({
      primaryActionParams: data.value
    });
  }

  handleModalOpen() {
    this.setState({ modalOpen: true });
  }

  handleModalClose() {
    this.setState({ modalOpen: false });
  }

  renderCell(rowData, key) {
    if (rowData[key] == null) {
      return '--';
    } else if ((this.isBoolean(rowData[key]) && rowData[key] === true) || rowData[key] === 1) {
      return <Icon name="checkmark" />;
    } else if ((this.isBoolean(rowData[key]) && rowData[key] === false) || rowData[key] === 0) {
      return <Icon name="close" />;
    } else {
      return rowData[key];
    }
  }

  renderCells() {
    const { columnData, rowData, primaryActionHandler, primaryActionLabel } = this.props;
    const { primaryActionParams } = this.state;

    const cell = columnData
      .filter(column => column.visible)
      .map(column =>
        <Table.Cell key={this.getRandomKey(rowData.id ? rowData.id : rowData.name)}>
          <div>
            {this.renderCell(rowData, column.key)}
          </div>
        </Table.Cell>
      );

    if (typeof primaryActionHandler !== 'undefined' && primaryActionHandler !== null && typeof primaryActionHandler === 'function') {
      cell.push((
        <Table.Cell key={rowData.id ? rowData.id : rowData.name}>

          <Modal
            trigger={
              <Button
                onClick={this.handleModalOpen}
                compact
                color="green"
                size="mini">{primaryActionLabel}
              </Button>
            }
            open={this.state.modalOpen}
            onClose={this.handleModalClose}>

            <Header icon="question" content="Enter optional input parameters for action" />
            <Modal.Content>
              <Form>
                <TextArea autoHeight placeholder="JSON input" value={primaryActionParams} onChange={this.onParamChange} />
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button basic color="red" onClick={this.handleModalClose} >
                <Icon name="remove" /> Cancel
              </Button>
              <Button color="green" onClick={this.handlePrimaryAction}>
                <Icon name="checkmark" /> {primaryActionLabel}
              </Button>
            </Modal.Actions>
          </Modal>
        </Table.Cell>
      ));
    }

    return cell;
  }

  handleRowClicked(rowIndex) {
    console.log('TableRow.handleRowClicked(): rowIndex', rowIndex);
    const { rowClickHandler } = this.props;
    if (typeof rowClickHandler !== 'undefined' && rowClickHandler !== null && typeof rowClickHandler === 'function') {
      rowClickHandler(rowIndex);
    }
  }

  handlePrimaryAction() {
    const { rowData, primaryActionHandler } = this.props;
    const { primaryActionParams } = this.state;

    console.log('TableRow.handlePrimaryAction() passing back', rowData);
    console.log('TableRow.handlePrimaryAction() parameters', primaryActionParams);
    primaryActionHandler(rowData, primaryActionParams);
    this.handleModalClose();
  }

  render() {
    const { rowIndex } = this.props;
    const { rowHighlight } = this.state;

    return (
      <Table.Row
        onClick={() => this.handleRowClicked(rowIndex)}
        className={rowHighlight ? 'positive' : 'null'} >
        {this.renderCells()}
      </Table.Row>
    );
  }
}

TableRow.propTypes = {
  columnData: PropTypes.arrayOf(PropTypes.object),
  rowData: PropTypes.object.isRequired,
  rowIndex: PropTypes.number.isRequired,
  rowClickHandler: PropTypes.func.isRequired,
  rowHighlight: PropTypes.bool,
  primaryActionHandler: PropTypes.func,
  primaryActionLabel: PropTypes.string
};

export default TableRow;
