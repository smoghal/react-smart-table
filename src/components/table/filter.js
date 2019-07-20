
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Label, Dropdown } from 'semantic-ui-react';
import _ from 'lodash';

const regex = new RegExp('^[a-zA-Z0-9-_ .:]+$');

class TableFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterValue: this.props.filter,
      filterValid: true
    };
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleFieldChange(event) {
    const { target: { name, value } } = event;
    console.log('TableFilter.handleFieldChange(): name, value', name, value);

    if (value !== '' && !regex.test(value)) {
      this.setState({ filterValue: value, filterValid: false });
    } else {
      this.setState({ filterValue: value, filterValid: true });
      this.props.onFilterChange(value);
    }
  }

  handleSubmit(_, value) {
    console.log('TableFilter.handleSubmit() value:', value);
  }

  render() {
    const { filterValue } = this.state;
    return (
      <div className="smart-table-filter">
        <Form onSubmit={this.handleSubmit}>
          <Form.Input
            name="filterText"
            label={{ content: <Icon color="blue" name="search" size="large" /> }}
            placeholder="Enter table filter"
            icon={<Icon color="blue" name="search" size="large" />}
            iconPosition="left"
            value={filterValue}
            onChange={this.handleFieldChange} />
        </Form>
      </div>
    );
  }
}

// Runtime type checking for React props
TableFilter.propTypes = {
  filter: PropTypes.string.isRequired,
  onFilterChange: PropTypes.func.isRequired
};

export default TableFilter;
