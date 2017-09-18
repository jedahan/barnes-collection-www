import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router'
import * as ObjectActions from '../../actions/object';
import * as PrintActions from '../../actions/prints';
import * as UIActions from '../../actions/ui';
import { getArtObjectUrlFromId } from '../../helpers';
import { META_TITLE, CANONICAL_ROOT } from '../../constants';
import SiteHeader from '../../components/SiteHeader/SiteHeader';
import SiteHtmlHelmetHead from '../../components/SiteHtmlHelmetHead';
import HtmlClassManager from '../../components/HtmlClassManager';
import TabbedContent from './TabbedContent/TabbedContent';
import Footer from '../../components/Footer/Footer';
import './artObjectPage.css';

class ArtObjectPage extends Component {
  constructor(props) {
    super(props);

    const urlPath = props.location.pathname;
    const baseUrlMatch = urlPath.match('/objects/[0-9]*/');

    if (!baseUrlMatch) {
      // it's missing the slash. Do a quick redirect here for now.
      // todo: it'd be better to move this to a router later.
      window.location = window.location.pathname + '/';
      return;
    }

    const artObjectId = parseInt(props.match.params.id, 10);
    const panelSlug = props.match.params.panel || '';

    this.state = {
      panelSlug: panelSlug,
      baseUrl: baseUrlMatch[0],
      artObjectId: artObjectId,
    };

    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.prints.length === 0) {
      this.props.getPrints();
    }

    this.props.getObject(this.state.artObjectId);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.match.params !== nextProps.match.params) {
      const baseUrlMatch = nextProps.location.pathname.match('/objects/[0-9]*/');
      if (!baseUrlMatch) {
        window.location = window.location.pathname + '/';
        return;
      }

      const artObjectId = parseInt(nextProps.match.params.id, 10);
      const panelSlug = nextProps.match.params.panel || '';

      this.setState({
        panelSlug: panelSlug,
        baseUrl: baseUrlMatch[0],
        artObjectId: artObjectId
      });

      this.props.getObject(artObjectId);
    }
  }

  handleKeyUp(e) {
    if (e.which === 27) {
      this.props.hideZoomOverlay();
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    this.props.submitDownloadForm(this.props.object.invno, this.downloadReason.value);
    this.downloadReason.value = '';
    this.downloadToggle.checked = false;
  }

  render() {
    const object = this.props.object;
    const metaTitle = `${META_TITLE} — ${object.culture || object.people}: ${object.title}`;
    const metaImage = object.imageUrlSmall;

    return (
      <div className="app app-art-object-page">
        <SiteHtmlHelmetHead
          metaTitle={metaTitle}
          metaImage={metaImage}
        />
        <HtmlClassManager />
        <SiteHeader />

        {/* todo: temp quick style. Need to get the AI for this page. */}
        {
          <div className="container">
            <h1 style={{textAlign: 'center', margin: '0 0 2rem 0'}} className="art-object__title font-alpha">{object.title}</h1>
          </div>
        }
        <TabbedContent
          onKeyUp={this.handleKeyUp}
          slug={this.state.panelSlug}
          object={object}
        />
        <Footer />
      </div>
    );
  }
}

function mapStateToProps(state) {
  // return Object.assign({}, {artObject: state.object}, { prints: state.prints }, { ui: state.ui });
  return {
    object: state.object,
    prints: state.prints,
    ui: state.ui
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(Object.assign({}, ObjectActions, PrintActions, UIActions), dispatch);
}

const compWithRouter = withRouter(ArtObjectPage);
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(compWithRouter));
