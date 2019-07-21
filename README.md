# Overview

A react smart table that uses [React-Semantic-UI Table][react-table-semantic-ui] component with added bells and whistles:

- Sortable columns
- Filter contents by searching for text across entire dataset loaded in table
- Pagination support
- Resizable details pane that shows hidden fields not displayed in the main table view
- Show a custom component inside table view (replaces table contents completely)
- Ability to send anchor links to details pane for cross-component navigation
- Data edit and delete hooks
- Pagniation hooks to control the user experience

Limitations:

- Lacks display of JSON object as table fields

Following screenshot shows the default smart table view with pagination enabled

![screenshot1]

Screenshot below shows how details pane is rendered when user clicks on a row.  Additional record controls are visble in details pane.

![screenshot2]

Table filter field can be used to narrow down contents.  This field can be set programmetically as well.

![screenshot3]

## Usage

Refer to `component/app.js` on basic usage.

## Smart Table API

TBD

## License

ISC

<!-- References -->
[react-table-semantic-ui]: https://react.semantic-ui.com/collections/table/
[screenshot1]: ./docs/smart_table_1.png
[screenshot2]: ./docs/smart_table_2.png
[screenshot3]: ./docs/smart_table_3.png
