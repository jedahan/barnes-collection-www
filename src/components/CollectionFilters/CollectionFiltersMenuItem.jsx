import React, { Component } from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as FilterSetsActions from '../../actions/filterSets';

class CollectionFiltersMenuItem extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    this.props.selectFilterSet(this.props.slug);
  }

  getClassNames() {
    const slug = this.props.slug;
    let classNames = 'btn-collection-filter font-zeta color-light';

    if (slug === 'search') {
      classNames += ' btn-collection-filter--search';
    } else if (slug === 'shuffle') {
      classNames += ' btn-collection-filter--shuffle';
    }

    if (slug === this.props.filterSets.visibleFilterSet) {
      classNames += ' is-selected';
    }

    return classNames;
  }

  render() {
    const slug = this.props.slug;
    const svgId = this.props.svgId;

    return (
      <button
        className={this.getClassNames()}
        onClick={this.handleClick}
        data-tip={this.props.tooltip}
        data-for="collectionFilterMenuItem"
      >
        <div className="button-inner">
          <svg className={`icon icon-${svgId} collection-filter-icon`}><use xlinkHref={`#icon-${svgId}`}></use></svg>
          <span>
            {this.props.title}
          </span>
        </div>
      </button>
    );
  }
}

const mapStateToProps = state => {
  return {
    filterSets: state.filterSets
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators(Object.assign(
    {},
    FilterSetsActions
  ), dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionFiltersMenuItem);
