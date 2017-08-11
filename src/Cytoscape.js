// @flow

import React from 'react';
import cytoscape from 'cytoscape';
import cytoscapeDagre from 'cytoscape-dagre';

import './cytoscape.css';

class Cytoscape extends React.Component {
  props: {
    elements: Object,
    onNodeTap: Object => void,
    onEdgeTap: Object => void,
  };

  state: {
    cytoscapeContainer: any,
  };

  cy = null;

  initCytoscape = (elements: Object = this.props.elements) => {
    if (elements.nodes.length === 0) {
      return;
    }
    cytoscapeDagre(cytoscape);
    const cy = cytoscape({
      container: this.state.cytoscapeContainer,
      boxSelectionEnabled: false,
      autounselectify: true,
      autoungrabify: true,
      zoomingEnabled: true,
      panningEnabled: true,
      userPanningEnabled: true,
      userZoomingEnabled: true,
      layout: {
        name: 'dagre',
        nodeSep: 200,
        rankSep: 100,
      },
      style: [
        {
          selector: 'node',
          style: {
            content: 'data(label)',
            'text-opacity': 0.7,
            'text-valign': 'center',
            'text-halign': 'right',
            'text-margin-x': '4px',
            'background-color': 'data(color)',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 4,
            content: 'data(label)',
            'text-opacity': 0.7,
            'text-background-color': '#fff',
            'text-background-opacity': 1,
            'text-background-padding': 3,
            'text-border-opacity': 0.7,
            'text-border-color': '#000',
            'text-border-width': 1,
            'curve-style': 'bezier',
            'target-arrow-shape': 'triangle',
            'line-color': 'data(color)',
            'target-arrow-color': 'data(color)',
          },
        },
      ],
      elements,
    });

    cy.minZoom(0.2);
    cy.maxZoom(2);
    cy.resize();

    cy.on('tap', 'node', event => {
      this.props.onNodeTap(event.target.data('flowEvent'));
    });

    cy.on('tap', 'edge', event => {
      this.props.onEdgeTap(event.target.data('flowEvent'));
    });

    this.cy = cy;
  };

  shouldComponentUpdate() {
    return false;
  }

  componentWillReceiveProps(nextProps: Object) {
    if (this.cy === null) {
      return this.initCytoscape(nextProps.elements);
    }
    this.cy.json(nextProps.elements);
  }

  componentWillUnmount() {
    if (this.cy) {
      this.cy.destroy();
    }
  }

  render = () =>
    <div
      ref={element =>
        this.setState({ cytoscapeContainer: element }, this.initCytoscape)}
      className="cytoscape"
    />;
}

export default Cytoscape;
