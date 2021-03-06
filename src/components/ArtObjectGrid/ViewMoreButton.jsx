import React, { Component } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as ObjectsActions from '../../actions/objects';
import SpinnerLoader from './SpinnerLoader';

class ViewMoreButton extends Component {
  constructor(props) {
    super(props);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const search = this.props.search;
    const filters = this.props.filters;

    const hasSearch = search.length > 0;
    const hasFilters = filters.ordered && filters.ordered.length > 0;

    let query = null;

    if (hasSearch) {
      query = search;
    } else if (hasFilters) {
      query = filters;
    }

    this.props.getNextObjects(this.props.objectsQuery.lastIndex, query);
  }

  render() {
    const searchIsPending = this.props.objectsQuery.isPending;
    const hasMoreResults = this.props.objectsQuery.hasMoreResults;

    if (!hasMoreResults) {
      return <div></div>;
    }

    if (searchIsPending) {
      return <SpinnerLoader />;
    }

    return (
      <div className="view-more-button m-block m-block--no-border m-block--flush-bottom">
        <button
          className="btn"
          onClick={this.handleClick}
        >
          View More
        </button>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    filters: state.filters,
    search: state.search,
    objects: state.objects,
    objectsQuery: state.objectsQuery
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(Object.assign({},
    ObjectsActions
  ), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewMoreButton);
