import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Segment, Label, Button, Popup, Modal, Icon, Grid } from 'semantic-ui-react';

class DetailsPane extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      numberOfColumns: 2
    };
    this.renderGrid = this.renderGrid.bind(this);
    this.renderEmptyDetails = this.renderEmptyDetails.bind(this);
    this.renderDetails = this.renderDetails.bind(this);
    this.renderFieldDetail = this.renderFieldDetail.bind(this);
    this.renderFieldDetailLabel = this.renderFieldDetailLabel.bind(this);
    this.onCloseButtonClicked = this.onCloseButtonClicked.bind(this);
    this.onDeleteButtonClicked = this.onDeleteButtonClicked.bind(this);
    this.onEditButtonClicked = this.onEditButtonClicked.bind(this);
    this.onCloseModal = this.onCloseModal.bind(this);
    this.onConfirmDelete = this.onConfirmDelete.bind(this);
    this.onMaximizeButtonClicked = this.onMaximizeButtonClicked.bind(this);
    this.onMinimizeButtonClicked = this.onMinimizeButtonClicked.bind(this);
    this.onRestoreButtonClicked = this.onRestoreButtonClicked.bind(this);
    this.onAnchorLinkClicked = this.onAnchorLinkClicked.bind(this);
  }

  getRandomKey(rowId) {
    const currTime = new Date().getTime();
    const key = `${rowId}-${Math.floor(Math.random() * Math.floor(currTime))}`;

    return key;
  }

  isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  /**
   * Render fields based on field types.  For example, if fieldData is an array
   * or JSON, display preformatted text for better readability.
   * @param  {string} fieldKey Key to show in detail pane
   * @param  {string} fieldData Data for given key
   * @param  {node} fieldValue JSX node value containing fieldData
   * @param  {Object} anchorLinkValueMap Anchor link objects. Value of the object key is another Object.
   * @return {node} JSX Node for rendering
   */
  renderFieldDetailLabel(fieldKey, fieldData, fieldValue, anchorLinkValueMap) {
    // if anchor link is set for this field, return a decorated label
    if (anchorLinkValueMap) {
      return (
        <Label
          basic size="small"
          className="json-align-decorated"
          // color="orange"
          onClick={() => anchorLinkValueMap && typeof anchorLinkValueMap.send_field_value !== 'undefined' && anchorLinkValueMap.send_field_value
            ? this.onAnchorLinkClicked(fieldKey, fieldData, anchorLinkValueMap.location)
            : this.onAnchorLinkClicked(fieldKey, null, anchorLinkValueMap.location)}>{fieldValue}</Label>
      );
    }

    // in all other cases, return a basic label without anchor link
    return (
      <Label className="json-align" basic size="small">{fieldValue}</Label>
    );
  }

  /**
   * Render fields based on field types.  For example, if fieldData is an array
   * or JSON, display preformatted text for better readability.
   * @param  {string} fieldKey Key to show in detail pane
   * @param  {string} fieldData Data for given key
   * @param  {Object} anchorLinkValueMap Anchor link objects. Value of the object key is another Object.
   * @return {null} No return types
   */
  renderFieldDetail(fieldKey, fieldData, anchorLinkValueMap) {
    // console.log('DetailsPane.renderFieldDetail() fieldKey, fieldData, anchorLinkValueMap:', fieldKey, fieldData, anchorLinkValueMap);
    var fieldValue = '';

    // perform following checks on fieldData:
    // 1. undefined or null, then return '--'
    // 2. array type, then further determine
    //    a. first element is a string value, if yes, then do further processing
    //    b. otherwise, simply do JSON.stringify on fieldData for rendering
    // 3. in all other cases, JSON.stringify on fieldData for rendering
    if (typeof fieldData === 'undefined' || fieldData === null || fieldData === 'null') {
      fieldValue = (
        <span className={anchorLinkValueMap && typeof anchorLinkValueMap.location !== 'undefined' && anchorLinkValueMap.location
          ? 'left-align-decorated' : 'left-align'}>--</span>
      );
      return this.renderFieldDetailLabel(fieldKey, fieldData, fieldValue, anchorLinkValueMap);
    } else if (fieldData !== null && Array.isArray(fieldData)) {
      // determine if first element is string
      if (typeof fieldData[0] === 'string') {
        fieldValue = (
          <pre className={anchorLinkValueMap && typeof anchorLinkValueMap.location !== 'undefined' && anchorLinkValueMap.location
            ? 'left-align-decorated' : 'left-align'}>{JSON.stringify(fieldData, undefined, 2)}</pre>
        );
        // make a copy of fieldData array
        const arr = fieldData.slice();
        // pick the first element and remove last two '.' notations from it
        const splitArray = arr[0].split('.');
        let stringFieldData = splitArray.splice(0, splitArray.length - 2).join('.');
        if (typeof stringFieldData === 'undefined' || stringFieldData === null || stringFieldData === '') {
          stringFieldData = arr[0];
        }
        return this.renderFieldDetailLabel(fieldKey, stringFieldData, fieldValue, anchorLinkValueMap);
      } else {
        // in all other cases, stringify fieldData
        fieldValue = (
          <pre className={anchorLinkValueMap && typeof anchorLinkValueMap.location !== 'undefined' && anchorLinkValueMap.location
            ? 'left-align-decorated' : 'left-align'}>{JSON.stringify(fieldData, undefined, 2)}</pre>
        );
        return this.renderFieldDetailLabel(fieldKey, fieldData, fieldValue, anchorLinkValueMap);
      }
    } else {
      fieldValue = (
        <span className={anchorLinkValueMap && typeof anchorLinkValueMap.location !== 'undefined' && anchorLinkValueMap.location
          ? 'left-align-decorated' : 'left-align'}>{JSON.stringify(fieldData, undefined, 2)}</span>
      );
      return this.renderFieldDetailLabel(fieldKey, fieldData, fieldValue, anchorLinkValueMap);
    }
  }

  renderGrid() {
    console.log('DetailsPane.renderGrid() called');

    const { data, anchorLinks } = this.props;
    const { numberOfColumns } = this.state;
    const prunedData = Object.assign({}, data);

    // remove id
    // delete prunedData.id;

    // reduce an object as follows into an array of arrays. the sub array
    // length is equal to or less than numberOfColumns
    // { key1: 'val1', key2: 'val2', key3: 1, key4: 'val4', key5: true}
    // to:
    // [
    //  [
    //    { key1: 'val1'},
    //    { key2: 'val2'}
    //  ],
    //  [
    //    { key3: 1 },
    //    { key4: 'val4' }
    //  ]
    //  [
    //    { key5: true },
    //  ]
    // ]
    const columnsData = Object.keys(prunedData).reduce((result, value, index, array) => {
      if (index % numberOfColumns === 0) {
        result.push(array.slice(index, index + numberOfColumns).reduce((r, v, i, a) => {
          r.push({ [v]: data[v] });
          return r;
        }, []));
      }
      return result;
    }, []);

    // reduce anchorLinks array into a map
    // [
    //   { field_name: 'val1', location: 'loc1', send_field_value: true },
    //   { field_name: 'val2', location: 'loc2', send_field_value: false }
    // ]
    // to
    // {
    //   val1: { location: 'loc1', send_field_value: true }
    //   val2: { location: 'loc2', send_field_value: false }
    // }
    const anchorLinksMap = typeof anchorLinks !== 'undefined' && anchorLinks
      ? anchorLinks.reduce((result, value) => {
        result[value.field_name] = { location: value.location, send_field_value: value.send_field_value };
        return result;
      }, {})
      : [];

    console.log('DetailsPane.renderGrid() data', data);
    console.log('DetailsPane.renderGrid() anchorLinks', anchorLinks);
    console.log('DetailsPane.renderGrid() reduced columnsData', columnsData);
    console.log('DetailsPane.renderGrid() reduced anchorLinksMap', anchorLinksMap);

    // const details = Object.keys(data).filter(key => key !== 'id').map((key, index) => {
    //   <Label key={index}>
    //     {console.log('DetailsPane.renderDetails() index, key, value', index, key, data[key])}
    //     {key}
    //     <Label.Detail>{JSON.stringify(data[key])}</Label.Detail>
    //   </Label>
    // });

    // if numberOfColumns === 2
    const details = columnsData.map((rowKey, rowIndex) =>
      (
        <Grid.Row key={rowIndex}>
          {
            rowKey.map((columnKey, columnIndex) =>
              (
                <Grid.Column key={columnIndex} textAlign={columnIndex === 0 ? 'right' : 'left'}>
                  {
                    Object.keys(columnKey).map((objKey, objIndex) =>
                      (
                        <div key={objIndex}>
                          {columnIndex === 0 && (
                            <div>
                              {
                                typeof anchorLinksMap[objKey] !== 'undefined'
                                  ? this.renderFieldDetail(objKey, columnKey[objKey], anchorLinksMap[objKey])
                                  : this.renderFieldDetail(objKey, columnKey[objKey], null)
                              }
                              <Label>{objKey}</Label>
                            </div>
                          )}
                          {columnIndex !== 0 && (
                            <div>
                              <Label>{objKey}</Label>
                              {
                                typeof anchorLinksMap[objKey] !== 'undefined'
                                  ? this.renderFieldDetail(objKey, columnKey[objKey], anchorLinksMap[objKey])
                                  : this.renderFieldDetail(objKey, columnKey[objKey], null)
                              }
                            </div>
                          )}
                        </div>
                      )
                    )
                  }
                </Grid.Column>
              )
            )
          }
        </Grid.Row>
      )
    );

    return details;
  }

  renderEmptyDetails() {
    console.log('DetailsPane.renderEmptyDetails() called');

    return (
      <div className="details-pane">
        <Segment basic clearing className="button-holder-segment">
          <Label size="small" floated="left" className="control-label">Select a row above</Label>
          <Popup
            trigger={
              <Button
                compact
                floated="right"
                onClick={this.onMaximizeButtonClicked}
                icon="window maximize"
                size="mini" />
            }
            content="Maximize" />
          <Popup
            trigger={
              <Button
                compact
                floated="right"
                onClick={this.onMinimizeButtonClicked}
                icon="window minimize"
                size="mini" />
            }
            content="Minimize" />
          <Popup
            trigger={
              <Button
                compact
                floated="right"
                onClick={this.onRestoreButtonClicked}
                icon="window restore"
                size="mini" />
            }
            content="Restore" />
        </Segment>
      </div>
    );
  }

  renderDetails() {
    console.log('DetailsPane.renderDetails() called');
    const { showModal, numberOfColumns } = this.state;
    const {
      enableDelete,
      enableEdit } = this.props;

    return (
      <div className="details-pane">
        <Segment basic clearing className="button-holder-segment">
          <Label size="small" floated="left" className="control-label">Details</Label>
          <Popup
            trigger={
              <Button
                compact
                floated="right"
                onClick={this.onCloseButtonClicked}
                icon="close"
                size="mini" />
            }
            content="Close"
            size="small" />
          { enableDelete && (
            <Popup
              trigger={
                <Button
                  compact
                  floated="right"
                  onClick={this.onDeleteButtonClicked}
                  icon="trash"
                  size="mini" />
              }
              content="Delete this record"
              size="small" />
          )}
          { enableEdit && (
            <Popup
              trigger={
                <Button
                  compact
                  floated="right"
                  onClick={this.onEditButtonClicked}
                  icon="edit"
                  size="mini" />
              }
              content="Edit this record"
              size="small" />
          )}
          <Popup
            trigger={
              <Button
                compact
                floated="right"
                onClick={this.onMaximizeButtonClicked}
                icon="window maximize"
                size="mini" />
            }
            content="Maximize" />
          <Popup
            trigger={
              <Button
                compact
                floated="right"
                onClick={this.onRestoreButtonClicked}
                icon="window restore"
                size="mini" />
            }
            content="Restore" />
          <Modal size="mini" open={showModal} onClose={this.onCloseModal}>
            <Modal.Header>
              Delete Record
            </Modal.Header>
            <Modal.Content>
              <p>Are you sure you want to delete?</p>
            </Modal.Content>
            <Modal.Actions>
              <Button basic color="red" onClick={this.onCloseModal}>
                <Icon name="remove" /> No
              </Button>
              <Button color="green" inverted onClick={this.onConfirmDelete}>
                <Icon name="checkmark" /> Yes
              </Button>
            </Modal.Actions>
          </Modal>
        </Segment>
        <div className="details-contents">
          <Grid columns={numberOfColumns} >
            {this.renderGrid()}
          </Grid>
        </div>
      </div>
    );
  }

  onCloseButtonClicked() {
    console.log('DetailsPane.onCloseButtonClicked() clicked');
    this.props.handleClose();
  }

  onDeleteButtonClicked() {
    console.log('DetailsPane.onDeleteButtonClicked() showing modal');
    this.showModal();
  }

  onEditButtonClicked() {
    const { data, handleEdit } = this.props;

    console.log('DetailsPane.onEditButtonClicked() passing back', data);
    handleEdit(data);
  }

  showModal() {
    console.log('DetailsPane.showModal() showModal:', this.state.showModal);
    this.setState({ showModal: true });
  }

  onCloseModal() {
    console.log('DetailsPane.onCloseModal() showModal:', this.state.showModal);
    this.setState({ showModal: false });
  }

  onConfirmDelete() {
    console.log('DetailsPane.onConfirmDelete() called');
    const { data, handleDelete } = this.props;

    this.onCloseModal();
    this.onCloseButtonClicked();
    console.log('DetailsPane.onConfirmDelete() passing data back to parent', data);
    handleDelete(data);
  }

  onMaximizeButtonClicked() {
    console.log('DetailsPane.onMaximizeButtonClicked() called');
    const { handleMaximize } = this.props;

    handleMaximize();
  }

  onMinimizeButtonClicked() {
    console.log('DetailsPane.onMinimizeButtonClicked() called');
    const { handleMinimize } = this.props;

    handleMinimize();
  }

  onRestoreButtonClicked() {
    console.log('DetailsPane.onRestoreButtonClicked() called');
    const { handleRestore } = this.props;

    handleRestore();
  }

  onAnchorLinkClicked(fieldName, fieldValue, location) {
    console.log('DetailsPane.onAnchorLinkClicked() called');
    const { handleAnchorLink } = this.props;

    handleAnchorLink(fieldName, fieldValue, location);
  }

  render() {
    const { show } = this.props;
    return show ? this.renderDetails() : this.renderEmptyDetails();
  }
}

DetailsPane.propTypes = {
  show: PropTypes.bool.isRequired,
  data: PropTypes.object,
  anchorLinks: PropTypes.arrayOf(PropTypes.object),
  handleClose: PropTypes.func.isRequired,
  handleDelete: PropTypes.func,
  handleEdit: PropTypes.func,
  handleMaximize: PropTypes.func,
  handleMinimize: PropTypes.func,
  handleRestore: PropTypes.func,
  handleAnchorLink: PropTypes.func,
  enableDelete: PropTypes.bool,
  enableEdit: PropTypes.bool
};

export default DetailsPane;
