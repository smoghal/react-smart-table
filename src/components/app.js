import React, { Component } from 'react';
import { Segment, Button, Label, Loader, Popup } from 'semantic-ui-react';
// import { BrowserRouter as Router, Route, Redirect, Switch } from 'react-router-dom';
// import PropTypes from 'prop-types';
import SmartTable from './table/table';
import { tableData } from './sample_table_data';

class App extends Component {
  constructor(props) {
    super(props);

    // component level attributes. tracking via state is not important.
    this.ALLOW_EDITING = false;
    this.errorMessage = null;

    // component state variables. any change to state triggers render()
    this.state = {
      visibleColumns: [
        {
          name: 'Name', // displayed in table header
          key: 'name', // in tableData
          visible: true
        },
        {
          name: 'Gender',
          key: 'gender',
          visible: true
        },
        {
          name: 'Email',
          key: 'email',
          visible: true
        },
        {
          name: 'Age',
          key: 'age',
          visible: true
        },
        {
          name: 'Company',
          key: 'company',
          visible: true
        },
        {
          name: 'Member Since',
          key: 'registered',
          visible: true
        },
        {
          name: 'Status',
          key: 'isActive',
          visible: true
        }
      ]
    };

    // bind component methods to this object
    this.handleWindowClose = this.handleWindowClose.bind(this);
  }

  componentWillMount() {
    console.log('App.componentWillMount() props: ', this.props);
    window.addEventListener('beforeunload', this.handleWindowClose);
  }

  componentWillUnMount() {
    window.removeEventListener('beforeunload', this.handleWindowClose);
  }

  async handleWindowClose(e) {
    e.preventDefault();
    // do some cleanup (?) when window closes
  }

  onReloadButtonClicked() {
    console.log('App.onReloadButtonClicked() called');
  }

  onDeleteButtonClicked(data) {
    console.log('App.onDeleteButtonClicked() called', data);
  }
  onEditButtonClicked(data) {
    console.log('App.onEditButtonClicked() called', data);
  }
  onAnchorLinkClicked(fieldName, fieldValue, location) {
    console.log('App.onAnchorLinkClicked() called: fieldName, fieldValue, location:', fieldName, fieldValue, location);
  }

  render() {
    console.log('App.render() props: ', this.props);
    const { ALLOW_EDITING, errorMessage } = this;
    const { visibleColumns } = this.state;
    const ds = tableData;

    return (
      <div className="app">
        <Segment clearing className="button-holder-segment" color="blue">
          <Label size="large" floated="left" className="control-label">Members</Label>
          <span className="control-text">Ramdom data generated using online <a href="https://www.json-generator.com/" target="_blank">json-generator</a></span>
          {
            ALLOW_EDITING &&
            <Popup
              trigger={
                <Button
                  compact
                  floated="right"
                  onClick={this.onCreateButtonClicked}
                  icon="add"
                  size="mini" />
              }
              content="Create"
              size="small"
            />
          }
          <Popup
            trigger={
              <Button
                compact
                floated="right"
                onClick={this.onReloadButtonClicked}
                icon="refresh"
                size="mini" />
            }
            content="Reload"
            size="small" />
        </Segment>
        { !errorMessage && !ds && (
          <Loader active inline="centered" />
        )}
        { errorMessage && (
          <div className="error">
            Error: {errorMessage}
          </div>
        )}
        { !errorMessage && ds && ds.length === 0 && (
          <Segment basic textAlign="center">
            <Label as="span" color="red" pointing>Data is empty</Label>
          </Segment>
        )}
        { !errorMessage && ds && ds.length > 0 && (
          <SmartTable
            data={ds}
            columns={visibleColumns}
            // anchorLinks={links}
            // to set filter value, use filter="value"
            // filter={filterText}
            onDeleteRecord={this.onDeleteButtonClicked}
            onEditRecord={this.onEditButtonClicked}
            // onAnchorLink={this.onAnchorLinkClicked}
            enableDelete
            enableEdit
            showPagination
            initialPageSize={10} />
        )}
      </div>
    );
  }
}

export default App;
