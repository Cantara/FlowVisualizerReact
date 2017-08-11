// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import FlowVisualizer from 'react-flow-visualizer';

class App extends React.Component {
  props: {
    correlationId: string | void,
    getMessage: string => void,
    message: Array<Object>,
  };

  state: {
    flowEvent: Object,
  };

  constructor() {
    super();
    this.state = {
      flowEvent: {},
    };
  }

  onNodeTap = flowEvent => {
  };

  onEdgeTap = flowEvent => {
    this.setState({
      flowEvent,
    });
  };

  render = () => (
    <FlowVisualizer
      message={this.props.message}
      onNodeTap={this.onNodeTap}
      onEdgeTap={this.onEdgeTap}
    />
  );
}

ReactDOM.render(<App />, document.getElementById('app'));
