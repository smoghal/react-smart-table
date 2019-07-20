import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, Pagination, Icon, Label, Dropdown, Button } from 'semantic-ui-react';
import SplitPane from 'react-split-pane';

import TableFilter from './filter';
import TableRow from './row';
import TableHeader from './header';
import DetailsPane from './details_pane';

export default class SmartTable extends Component {
  constructor(props) {
    super(props);
    // component level attributes. tracking via state is not important.
    this.defaultPrimaryPaneSize = typeof props.primaryPaneDefaultSize === 'undefined' || props.primaryPaneDefaultSize === null || props.filter === '' ? '60%' : props.primaryPaneDefaultSize;
    this.defaultPrimaryPaneMaximizedSize = typeof props.primaryPaneMaximizedSize === 'undefined' || props.primaryPaneMaximizedSize === null || props.filter === '' ? '93%' : props.primaryPaneMaximizedSize;
    this.defaultPrimaryPaneMinimizedSize = typeof props.primaryPaneMinimizedSize === 'undefined' || props.primaryPaneMinimizedSize === null || props.filter === '' ? '23%' : props.primaryPaneMinimizedSize;
    this.pageSizeOptions = [ 5, 10, 25, 50, 100 ]; // numeric values to show in "row per page" dropdown.
    // component state variables. any change to state triggers render()
    this.state = {
      totalVisibleColumns: 5,
      totalRowCount: 0,
      offset: 0,
      limit: 10,
      filter: typeof props.filter === 'undefined' || props.filter === null || props.filter === '' ? '' : props.filter,
      filterApplied: '',
      direction: null,
      sortBy: 'id',
      tableData: [],
      tableColumns: [],
      anchorLinks: typeof props.anchorLinks === 'undefined' || props.anchorLinks === null || props.anchorLinks.length === 0 ? null : props.anchorLinks,
      showRowDetails: false,
      selectedRowIndex: null,
      showCustomComponent1: typeof props.customComponent1Show !== 'undefined' && props.customComponent1Show !== null && props.customComponent1Show,
      primaryPaneDefaultSize: this.defaultPrimaryPaneMaximizedSize, // initial size of primary pane
      primaryPaneSize: this.defaultPrimaryPaneMaximizedSize, // initial size of primary pane
      showPagination: typeof props.showPagination !== 'undefined' && props.showPagination !== null && props.showPagination
    };
    // bind component methods to this object
    this.setSmartTableState = this.setSmartTableState.bind(this);
    this.handleSmartTableColumnSort = this.handleSmartTableColumnSort.bind(this);
    this.handleSmartTableFilterChange = this.handleSmartTableFilterChange.bind(this);
    this.handleSmartTablePaginationPageChange = this.handleSmartTablePaginationPageChange.bind(this);
    this.handleSmartTablePaginationDropdownItemChange = this.handleSmartTablePaginationDropdownItemChange.bind(this);
    this.handleTableRowClick = this.handleTableRowClick.bind(this);
    this.handleDetailsPaneCloseDetails = this.handleDetailsPaneCloseDetails.bind(this);
    this.handleSplitPaneChange = this.handleSplitPaneChange.bind(this);
    this.handleSplitPaneDragStarted = this.handleSplitPaneDragStarted.bind(this);
    this.handleSplitPaneDragFinished = this.handleSplitPaneDragFinished.bind(this);
    this.handleSplitPaneResizerClick = this.handleSplitPaneResizerClick.bind(this);
    this.handleSplitPaneResizerDoubleClick = this.handleSplitPaneResizerDoubleClick.bind(this);
    this.handleDetailsPaneMaximize = this.handleDetailsPaneMaximize.bind(this);
    this.handleDetailsPaneMinimize = this.handleDetailsPaneMinimize.bind(this);
    this.handleDetailsPaneRestore = this.handleDetailsPaneRestore.bind(this);
    this.handleDetailsPaneDeleteRecord = this.handleDetailsPaneDeleteRecord.bind(this);
    this.handleDetailsPaneEditRecord = this.handleDetailsPaneEditRecord.bind(this);
    this.handleDetailsPaneAnchorLink = this.handleDetailsPaneAnchorLink.bind(this);
    this.handleSmartTableLoadMoreItems = this.handleSmartTableLoadMoreItems.bind(this);
    this.applyFilter = this.applyFilter.bind(this);
  };
  componentWillMount() {
    console.log('SmartTable.componentWillMount() called', this.state, this.props);
    const { data, initialPageSize } = this.props;
    this.setSmartTableState(data, initialPageSize);
  }
  componentDidMount() {
    const { filter } = this.state;
    this.applyFilter(filter);
  }
  componentWillReceiveProps(newProps) {
    console.log('SmartTable.componentWillReceiveProps() newProps', newProps);
    // set custom component visiblity
    this.setState({
      showCustomComponent1: typeof newProps.customComponent1Show !== 'undefined' && newProps.customComponent1Show !== null && newProps.customComponent1Show
    });
    const { data, initialPageSize } = newProps;
    const { tableData, currentPageSize } = this.state;

    if (data !== tableData || initialPageSize !== currentPageSize) {
      console.log('SmartTable.componentWillReceiveProps(): Table data or page size changed. Refresh table.');
      this.setSmartTableState(data, initialPageSize);

      // Filter needs to be reapplied
      this.setState({
        filterApplied: ''
      }, () => this.applyFilter(newProps.filter));
    }
  }
  applyFilter(filter) {
    if (typeof filter !== 'undefined' && filter !== null && filter !== '') {
      console.log('SmartTable.applyFilter(): filter: ', filter);
      this.handleSmartTableFilterChange(filter);
    }
  }
  setSmartTableState(data, initialPageSize) {
    console.log('SmartTable.setSmartTableState() state changes: data, initiaPageSize', data, initialPageSize);

    // total number of records to show in one page. this is changeable via drop-down
    const pageSize = typeof initialPageSize === 'undefined' || initialPageSize === null || typeof initialPageSize !== 'number' ? this.pageSizeOptions[0] : initialPageSize;
    // current page selected in pagination footer
    const currentPage = 1;
    // total record count to show in table filter row
    // const totalRecordCount = data.length;
    // total number of pages set in pagination footer
    const totalPages = Math.ceil(data.length / pageSize);

    // build page size dropdown options (component level variable)
    this.pageSizeDropdownOptions = this.pageSizeOptions.reduce((result, value, index, _) => {
      const obj = {
        key: index,
        text: value.toString(),
        value
      };
      result.push(obj);
      return result;
    }, []);

    // set table state
    this.setState({
      tableData: data,
      totalPages,
      currentPage,
      currentPageSize: pageSize
    });

    // if this.props.columns is not set, then we build a column array
    // otherwise, set columns as passed to this component
    if (typeof this.props.columns === 'undefined' || this.props.columns === 0) {
      this.setState({ tableColumns: this.buildColumns() });
    } else {
      this.setState({ tableColumns: this.props.columns });
    }
  }
  buildColumns() {
    console.log('SmartTable.setColumns() building columns');
    const { totalVisibleColumns } = this.state;

    // grab the first row of table data
    // we assume that tableData contains homogenous properties
    const aRow = this.props.data[0];
    let columnCount = 0;
    const columns = [];

    try {
      for (const key of Object.keys(aRow)) {
        const c = {
          name: key,
          key,
          visible: (key !== 'id' && columnCount <= totalVisibleColumns) || false
        };

        columns.push(c);
        columnCount = columnCount + 1;
      }
    } catch (e) {
      console.log('SmartTable.setColumns() empty columns');
    }

    // column array structure is as follows:
    // [
    //   {
    //     name: 'Column Name1', // displayed in table header
    //     key: 'columnKey' // in tableData
    //     visible: true || false
    //   }
    // ]

    return columns;
  }
  handleSmartTableColumnSort(clickedColumn, direction) {
    console.log('SmartTable.handleSmartTableColumnSort().  column, direction: ', clickedColumn, direction);
    const { tableData } = this.state;
    // lets deselect highlight and close details pane before sorting
    this.handleDetailsPaneCloseDetails();

    const newTableData = tableData.slice();

    switch (direction) {
      case 'ascending': {
        newTableData.sort((a, b) => {
          const aValue = a[clickedColumn];
          const bValue = b[clickedColumn];

          if (typeof aValue === 'string') {
            const textA = aValue.toUpperCase();
            const textB = bValue.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
          } else if (typeof aValue === 'number') {
            return (aValue < bValue) ? -1 : (aValue > bValue) ? 1 : 0;
          } else {
            return 0;
          }
        });
        break;
      }
      case 'descending': {
        newTableData.sort((a, b) => {
          const aValue = a[clickedColumn];
          const bValue = b[clickedColumn];

          if (typeof aValue === 'string') {
            const textA = aValue.toUpperCase();
            const textB = bValue.toUpperCase();

            return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
          } else if (typeof aValue === 'number') {
            return (aValue > bValue) ? -1 : (aValue < bValue) ? 1 : 0;
          } else {
            return 0;
          }
        });
        break;
      }
    }

    this.setState({ tableData: newTableData });
  }
  handleTableRowClick(index) {
    console.log('SmartTable.handleTableRowClick() clicked, index:', index);

    this.setState({
      showRowDetails: true,
      selectedRowIndex: index
    });

    // maximize the details pane
    // this.handleMaximize();

    // call parents row click handler
    const { onSelectRecord } = this.props;
    if (typeof onSelectRecord !== 'undefined') {
      onSelectRecord(index);
    } else {
      console.log('SmartTable.handleTableRowClick() props.onSelectRecord not set. Stopping event propagation to parent component');
    }
  }
  handleCloseDetails() {
    console.log('SmartTable.handleCloseDetails() clicked');

    this.setState({
      showRowDetails: false,
      selectedRowIndex: null
    });

    // minimize the details pane
    this.handleMinimize();

    // call parents close handler
    const { onCloseRecord } = this.props;
    if (typeof onCloseRecord !== 'undefined') {
      onCloseRecord();
    } else {
      console.log('SmartTable.handleCloseDetails() props.onCloseRecord not set. Stopping event propagation to parent component');
    }
  }
  handleSmartTableFilterChange(filter) {
    const { filterApplied, tableData } = this.state;
    console.log('SmartTable.handleSmartTableFilterChange() filter, filterApplied', filter, filterApplied);

    if (filter !== filterApplied) {
      this.setState({ filterApplied: filter, offset: 0 });
      const { data } = this.props;

      if (typeof filter === 'undefined' || filter === '') {
        this.setState({ tableData: data });
        console.log('SmartTable.handleSmartTableFilterChange() resetting data', tableData);
      } else {
        // ES6! nice and compact (but doesn't work on non-string values)
        // https://stackoverflow.com/questions/8517089/js-search-in-object-values#18
        const filteredData =
          data.filter(o => Object.keys(o).some(k => {
            if (typeof o[k] === 'string') {
              // ignore case when running includes() test
              return o[k].toUpperCase().includes(filter.toUpperCase());
            } else {
              // TODO handle non-string values. Perhaps flaten + stringify them
              // console.log('SmartTable.handleSmartTableFilterChange() skipping filter for -> key: value', k, o[k]);
              return false;
            }
          }));

        console.log('SmartTable.handleSmartTableFilterChange() filteredData', filteredData);
        this.setState({ tableData: filteredData });
      }
    }
  }
  handleSmartTablePaginationPageChange(_, data) {
    console.log('SmartTable.handleSmartTablePaginationPageChange() clicked, data:', data);
    const { currentPageSize } = this.state;
    const { onPaginationPageChange } = this.props;
    // only send data to caller when this.props.<func> is set
    if (typeof onPaginationPageChange !== 'undefined' && onPaginationPageChange !== null && typeof onPaginationPageChange === 'function') {
      onPaginationPageChange(data.activePage, currentPageSize);
    }
    this.setState({
      currentPage: data.activePage
    });
  }
  handleSmartTablePaginationDropdownItemChange(_, dropDownData) {
    // console.log('TableFilter.handleSmartTablePaginationDropdownItemChange() value:', data);
    const { onPaginationPageSizeChange, data } = this.props;
    const { currentPage } = this.state;

    // set currentPageSize based on dropdown value
    const currentPageSize = dropDownData.value;
    // recalculate the totalPages in pagination bar
    const totalPages = Math.ceil(data.length / currentPageSize);

    // only send data to caller when this.props.<func> is set
    if (typeof onPaginationPageSizeChange !== 'undefined' && onPaginationPageSizeChange !== null && typeof onPaginationPageSizeChange === 'function') {
      onPaginationPageSizeChange(currentPage, currentPageSize);
    }
    this.setState({ currentPageSize, totalPages });
  }
  handleSmartTableLoadMoreItems() {
    console.log('SmartTable.handleSmartTableLoadMoreItems() clicked');
    const { onLoadMoreItems } = this.props;
    // only send data to caller when this.props.<func> is set
    if (typeof onLoadMoreItems !== 'undefined' && onLoadMoreItems !== null && typeof onLoadMoreItems === 'function') {
      onLoadMoreItems();
    }
  }
  handleDetailsPaneCloseDetails() {
    console.log('SmartTable.handleDetailsPaneCloseDetails() clicked');

    this.setState({
      showRowDetails: false,
      selectedRowIndex: null
    });

    // also minimize the details pane
    this.handleDetailsPaneMinimize();
  }
  handleDetailsPaneDeleteRecord(data) {
    console.log('SmartTable.handleDetailsPaneDeleteRecord() clicked.  data:', data);
    const { onDeleteRecord } = this.props;
    // only send data to caller when this.props.<func> is set
    if (typeof onDeleteRecord !== 'undefined' && onDeleteRecord !== null && typeof onDeleteRecord === 'function') {
      onDeleteRecord(data);
    }
  }
  handleDetailsPaneEditRecord(data) {
    console.log('SmartTable.handleDetailsPaneEditRecord() clicked.  data:', data);
    const { onEditRecord } = this.props;
    // only send data to caller when this.props.<func> is set
    if (typeof onEditRecord !== 'undefined' && onEditRecord !== null && typeof onEditRecord === 'function') {
      onEditRecord(data);
    }
  }
  handleSplitPaneChange(event, size) {
    // console.log('SmartTable.handleSplitPaneChange() event, size', event, size);
  }
  handleSplitPaneDragStarted(event, size) {
    // console.log('SmartTable.handleSplitPaneDragStarted() event, size', event, size);
  }
  handleSplitPaneDragFinished(event, size) {
    console.log('SmartTable.handleSplitPaneDragFinished() event, size', event, size);
    this.setState({ primaryPaneSize: size });
  }
  handleSplitPaneResizerClick(event, size) {
    console.log('SmartTable.handleSplitPaneResizerClick() event, size', event, size);
  }
  handleSplitPaneResizerDoubleClick(event, size) {
    console.log('SmartTable.handleSplitPaneResizerDoubleClick() event, size', event, size);
  }
  handleDetailsPaneMaximize() {
    console.log('SmartTable.handleDetailsPaneMaximize() called');
    this.setState({
      primaryPaneDefaultSize: this.defaultPrimaryPaneMinimizedSize,
      primaryPaneSize: this.defaultPrimaryPaneMinimizedSize
    });
  }
  handleDetailsPaneMinimize() {
    console.log('SmartTable.handleDetailsPaneMinimize() called');
    this.setState({
      primaryPaneDefaultSize: this.defaultPrimaryPaneMaximizedSize,
      primaryPaneSize: this.defaultPrimaryPaneMaximizedSize
    });
  }
  handleDetailsPaneRestore() {
    console.log('SmartTable.handleDetailsPaneRestore() called');
    this.setState({
      primaryPaneDefaultSize: this.defaultPrimaryPaneSize,
      primaryPaneSize: this.defaultPrimaryPaneSize
    });
  }
  handleDetailsPaneAnchorLink(fieldName, fieldValue, location) {
    console.log('SmartTable.handleDetailsPaneAnchorLink() called: fieldName, fieldValue, location', fieldName, fieldValue, location);
    const { onAnchorLink } = this.props;
    // only send data to caller when this.props.<func> is set
    if (typeof onAnchorLink !== 'undefined' && onAnchorLink !== null && typeof onAnchorLink === 'function') {
      onAnchorLink(fieldName, fieldValue, location);
    } else {
      console.log('SmartTable.handleDetailsPaneAnchorLink() props.onAnchorLink not set. Stopping event propagation to parent component');
    }
  }
  render() {
    const {
      filter,
      tableData,
      tableColumns,
      anchorLinks,
      showRowDetails,
      selectedRowIndex,
      primaryPaneDefaultSize,
      primaryPaneSize,
      showCustomComponent1,
      showPagination,
      totalPages,
      currentPage,
      currentPageSize } = this.state;
    const {
      enableEdit,
      enableDelete,
      onPrimaryAction,
      errorMessage,
      primaryActionLabel,
      customComponent1,
      hasMoreItems } = this.props;

    // build table rows
    // if showPagination is true, include the n entries in tableData array based on current page number, where n = pageSize
    // otherwise, include all entries in tableData array to show in SmartTable
    const tableRows =
      showPagination
        ? tableData.filter((_, index) => (currentPageSize * (currentPage - 1) <= index) && (index < currentPage * currentPageSize))
          .map((row, index) =>
            <TableRow
              key={index}
              rowData={row}
              rowIndex={index}
              columnData={tableColumns}
              rowClickHandler={this.handleTableRowClick}
              rowHighlight={(typeof selectedRowIndex !== 'undefined' && selectedRowIndex !== null && index === selectedRowIndex)}
              primaryActionHandler={onPrimaryAction}
              primaryActionLabel={primaryActionLabel} />
          )
        : tableData.map((row, index) =>
          <TableRow
            key={index}
            rowData={row}
            rowIndex={index}
            columnData={tableColumns}
            rowClickHandler={this.handleTableRowClick}
            rowHighlight={(typeof selectedRowIndex !== 'undefined' && selectedRowIndex !== null && index === selectedRowIndex)}
            primaryActionHandler={onPrimaryAction}
            primaryActionLabel={primaryActionLabel} />
        );

    const selectedTableData = tableData[typeof selectedRowIndex !== 'undefined' && selectedRowIndex !== null ? selectedRowIndex : 0];

    return (
      <div>
        <SplitPane
          split="horizontal"
          className="smart-table"
          defaultSize={primaryPaneDefaultSize}
          size={primaryPaneSize}
          onChange={this.handleSplitPaneChange}
          onDragStarted={this.handleSplitPaneDragStarted}
          onDragFinished={this.handleSplitPaneDragFinished}
          onResizerClick={this.handleSplitPaneResizerClick}
          onResizerDoubleClick={this.handleSplitPaneResizerDoubleClick}
          pane1ClassName="split-pane-primary"
          pane2ClassName="split-pane-secondary"
          resizerClassName="split-pane-resizer">

          {/* Top pane of SplitPane - show custom component, e.g. visualization */}
          {console.log('SmartTable.render() showCustomComponent1: ', showCustomComponent1)}
          { showCustomComponent1 && customComponent1(selectedTableData) }

          {/* Top pane of SplitPane - show Table contents */}
          { !showCustomComponent1 && (
            <div className="smart-table-container">
              <TableFilter
                filter={filter}
                onFilterChange={this.handleSmartTableFilterChange} />
              <Table celled compact selectable sortable
                size="small">
                <TableHeader
                  sortByHandler={this.handleSmartTableColumnSort}
                  columnData={tableColumns} />
                <Table.Body>
                  {tableRows}
                </Table.Body>
                { showPagination && (
                  <Table.Footer>
                    <Table.Row>
                      <Table.HeaderCell colSpan={tableColumns.length}>
                        <div className="pagination-container">
                          <Label basic size="medium" className="total-records-label">
                            Total Records
                            <Label.Detail >{tableData.length}{hasMoreItems ? '+' : ''}</Label.Detail>
                          </Label>
                          { hasMoreItems && (
                            <Button compact className="load-more-button"
                              size="mini" floated="left"
                              onClick={this.handleSmartTableLoadMoreItems}
                              content="Load More Items" />
                          )
                          }
                          <div className="controls">
                            <Label basic size="medium" className="rows-per-page">Rows per page</Label>
                            <Dropdown
                              compact
                              className="page-size-dropdown"
                              onChange={this.handleSmartTablePaginationDropdownItemChange}
                              options={this.pageSizeDropdownOptions}
                              selection
                              value={currentPageSize} />
                            <div className="spacer" />
                            <Pagination
                              className="pagination"
                              size="mini"
                              ellipsisItem={{ content: <Icon name="ellipsis horizontal" />, icon: true }}
                              firstItem={{ content: <Icon name="angle double left" />, icon: true }}
                              lastItem={{ content: <Icon name="angle double right" />, icon: true }}
                              prevItem={{ content: <Icon name="angle left" />, icon: true }}
                              nextItem={{ content: <Icon name="angle right" />, icon: true }}
                              totalPages={totalPages}
                              activePage={currentPage}
                              onPageChange={this.handleSmartTablePaginationPageChange}
                            />
                          </div>
                        </div>
                      </Table.HeaderCell>
                    </Table.Row>
                  </Table.Footer>
                )}

              </Table>
            </div>
          )}

          {/* Bottom pane of SplitPane */}
          <DetailsPane
            show={showRowDetails}
            data={selectedTableData}
            anchorLinks={anchorLinks}
            handleClose={this.handleDetailsPaneCloseDetails}
            handleDelete={this.handleDetailsPaneDeleteRecord}
            handleEdit={this.handleDetailsPaneEditRecord}
            handleMaximize={this.handleDetailsPaneMaximize}
            handleMinimize={this.handleDetailsPaneMinimize}
            handleRestore={this.handleDetailsPaneRestore}
            handleAnchorLink={this.handleDetailsPaneAnchorLink}
            enableDelete={enableDelete}
            enableEdit={enableEdit} />
        </SplitPane>
      </div>
    );
  }
}

// Runtime type checking for React props
SmartTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  columns: PropTypes.arrayOf(PropTypes.object),
  anchorLinks: PropTypes.arrayOf(PropTypes.object),
  filter: PropTypes.string,
  errorMessage: PropTypes.string,
  onDeleteRecord: PropTypes.func,
  onEditRecord: PropTypes.func,
  onSelectRecord: PropTypes.func,
  onCloseRecord: PropTypes.func,
  onAnchorLink: PropTypes.func,
  onPrimaryAction: PropTypes.func,
  primaryActionLabel: PropTypes.string,
  customComponent1: PropTypes.any,
  customComponent1Show: PropTypes.bool,
  enableDelete: PropTypes.bool,
  enableEdit: PropTypes.bool,
  primaryPaneDefaultSize: PropTypes.string,
  primaryPaneMaximizedSize: PropTypes.string,
  primaryPaneMinimizedSize: PropTypes.string,
  showPagination: PropTypes.bool,
  onPaginationPageChange: PropTypes.func,
  onPaginationPageSizeChange: PropTypes.func,
  initialPageSize: PropTypes.number,
  hasMoreItems: PropTypes.bool,
  onLoadMoreItems: PropTypes.func
};
