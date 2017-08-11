// @flow

import React from 'react';
import Cytoscape from './Cytoscape';
import { FLOW_COLORS } from './constants';

type Props = {
  message: Array<Object>,
  onNodeTap: Object => void,
  onEdgeTap: Object => void,
};

const getColorForFlowType = type => {
  switch (type.toLowerCase()) {
    case 'filesystem':
      return FLOW_COLORS.FILESYSTEM;
    case 'http':
      return FLOW_COLORS.HTTP;
    case 'internal':
      return FLOW_COLORS.INTERNAL;
    case 'persistent storage':
      return FLOW_COLORS.PERSISTENT_STORAGE;
    case 'ses':
      return FLOW_COLORS.SES;
    case 'sqs':
      return FLOW_COLORS.SQS;
    default:
      return FLOW_COLORS.UNKNOWN;
  }
};

const generateEdge = (flowEvent: Object): Object => ({
  data: {
    id: flowEvent.history ? flowEvent.edge.id : flowEvent.edge.id + ' ',
    label: `${flowEvent.edge.milestone.substr(0, 13)}..`,
    source: flowEvent.history ? flowEvent.history.join('') : 'start',
    target: flowEvent.history
      ? flowEvent.history.join('') + flowEvent.edge.id
      : flowEvent.edge.id,
    color:
      flowEvent.edge.status.toLowerCase() === 'ok'
        ? FLOW_COLORS.EDGE_OK
        : FLOW_COLORS.EDGE_ERROR,
    flowEvent,
  },
});

const mapFlowArrayToElements = (flowEvents: Array<Object>): Object => {
  const nodeRegistry = {};
  const allEdges = {};

  // discover all nodes in the graph
  flowEvents.forEach(flowEvent => {
    if (flowEvent.history) {
      const previousNodeId = flowEvent.history.join('');
      const nextNodeId = previousNodeId + flowEvent.edge.id;

      if (flowEvent.source) {
        nodeRegistry[previousNodeId] = flowEvent.source.type;
      }
      if (flowEvent.destination) {
        nodeRegistry[nextNodeId] = flowEvent.destination.type;
      }
      // store all edges and nodes that we know nothing about so that we can construct a full graph
      for (let i = 1; i < flowEvent.history.length; i++) {
        const source = flowEvent.history.slice(0, i - 1).join('') || 'start';
        const target = flowEvent.history.slice(0, i).join('');
        allEdges[source + target] = { source, target };

        if (!nodeRegistry[source]) {
          nodeRegistry[source] = 'Unknown';
        }
        if (!nodeRegistry[target]) {
          nodeRegistry[target] = 'Unknown';
        }
      }
    } else {
      nodeRegistry.start = flowEvent.source.type;
      nodeRegistry[flowEvent.edge.id] = flowEvent.destination.type;
    }
  });

  const cytoscapeNodes = Object.keys(nodeRegistry).map(nodeId => ({
    data: {
      id: nodeId,
      label: nodeRegistry[nodeId],
      color: getColorForFlowType(nodeRegistry[nodeId]),
    },
  }));

  // register all edges (map adds existing edges, the concat adds edges missing from the dataset)
  let cytoscapeEdges = flowEvents.map(generateEdge);
  cytoscapeEdges = cytoscapeEdges.concat(
    Object.values(allEdges)
      .filter(({ source, target }) => {
        return !cytoscapeEdges.find(
          edge => edge.data.source === source && edge.data.target === target
        );
      })
      .map(({ source, target }) => ({
        data: {
          label: 'Unknown',
          source,
          target,
          color: FLOW_COLORS.EDGE_UNKNOWN,
          flowEvent: {},
        },
      }))
  );

  return {
    nodes: cytoscapeNodes,
    edges: cytoscapeEdges,
  };
};

const FlowVisualizer = ({ message, onNodeTap, onEdgeTap }: Props) =>
  <Cytoscape
    elements={mapFlowArrayToElements(message)}
    onNodeTap={onNodeTap}
    onEdgeTap={onEdgeTap}
  />;

export default FlowVisualizer;
