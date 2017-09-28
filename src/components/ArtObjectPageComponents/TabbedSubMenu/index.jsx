import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import PanelVisuallyRelated from '../PanelVisuallyRelated'
import PanelEnsemble from '../PanelEnsemble'
import PanelDetails from '../PanelDetails'
import { getArtObjectUrlFromId } from '../../../helpers';

class TabbedSubMenu extends Component {
  constructor(props) {
    super(props);

    const tabList = [
      {
        title: 'Visually Related',
        slug: '',
      },
      {
        title: 'Ensemble',
        slug: 'ensemble',
      },
      {
        title: 'Details',
        slug: 'details',
      },
    ];

    this.state = { tabs: tabList };
  }

  sanitizeEnsembleIndex(index) {
    return index ? index.split(',')[0] : null;
  }

  getTab() {
    switch(this.props.slug) {
      case 'ensemble':
        if (this.props.object.ensembleIndex) {
          return <PanelEnsemble ensembleIndex={this.sanitizeEnsembleIndex(this.props.object.ensembleIndex)}/>;
        } else {
          return <PanelVisuallyRelated />;
        }
      case 'details':
        return <PanelDetails />;
      default:
        return <PanelVisuallyRelated />;
    }
  }

  render() {
    return (
      <div>
        <div className="container">
          <nav className="m-tabs m-tabs--post-cta" data-behavior="Tabs">
            <div className="m-tabs__list">
              {
                this.state.tabs
                  .map(tabData => {
                    const isSelected = tabData.slug === this.props.slug;

                    if (!this.props.object.ensembleIndex && tabData.slug === 'ensemble') {
                      return null;
                    }

                    return (
                      <div key={tabData.slug} className="m-tabs__item">
                        <Link
                          className="m-tabs__link"
                          aria-current={isSelected}
                          to={getArtObjectUrlFromId(this.props.object.id, tabData.slug)}
                          onClick={this.handleContentTabClick(tabData.slug)}
                        >
                          {tabData.title}
                        </Link>
                      </div>
                    );
                  })
              }
            </div>
          </nav>
        </div>
        <div className="container">
          {this.getTab()}
        </div>
      </div>
    );
  }

  selectTab(tabKey) {
    this.setState({selectedTab: tabKey});
  }

  handleContentTabClick(slug) {
    return function(e) {
      this.selectTab(slug);
    }.bind(this);
  }
}

export default TabbedSubMenu;