import React, { Component } from 'react';
// import PropTypes from 'prop-types';

import Header from './Header';
import CollectionFiltersPanel from '../../components/CollectionFilters/CollectionFiltersPanel';
import ArtObjectGrid from '../../components/ArtObjectGrid/ArtObjectGrid';
import Footer from '../../components/Footer/Footer';

class LandingPage extends Component {

  constructor(props) {
    super(props);

    // Landing Page needs to:
    // - know all of the queries/tags the user has applied
    // - tell the art object grid what objects to display
  }

  render() {
    console.log(this.props.history);
    return (
      <div className="app">
        <h1>LandingPage</h1>
        <Header />
        <CollectionFiltersPanel />
        <ArtObjectGrid />
        <Footer />
      </div>
    );
  }
}

// LandingPage.propTypes = {
//   children: PropTypes.element
// };

export default LandingPage;
