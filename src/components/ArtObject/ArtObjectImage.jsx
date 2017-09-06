import React, { Component } from 'react';

class ArtObjectImage extends Component {
  componentDidMount() {
    setTimeout(() => {
      this.props.revealArtObject();
    }, 300);
  }

  render() {
    return (
      <img alt={this.props.alt} src={this.props.src}/>
    );
  }
}

export default ArtObjectImage;
