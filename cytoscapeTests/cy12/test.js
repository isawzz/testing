var cy = (window.cy = cytoscape({
  container: document.getElementById("cy"),

  boxSelectionEnabled: false,
  autounselectify: true,

  style: [{
      selector: "node",
      css: {
        content: "data(id)",
        "text-valign": "center",
        "text-halign": "center",
        height: "60px",
        width: "60px",
        "border-color": "black",
        "background-color": "gray",
        "border-opacity": "1",
        "border-width": "10px"
      }
    },
    {
      selector: "edge",
      css: {
        "target-arrow-shape": "triangle"
      }
    },
    {
      selector: "edge[label]",
      css: {
        label: "data(label)",
        "text-rotation": "autorotate",
        "text-margin-x": "0px",
        "text-margin-y": "0px"
      }
    },
    {
      selector: ":selected",
      css: {
        "background-color": "black",
        "line-color": "black",
        "target-arrow-color": "black",
        "source-arrow-color": "black"
      }
    }
  ],
  layout: {
    name: "circle"
  }
}));

var info = [{
    name: "Peter",
    next_op_name: "Claire"
  },
  {
    name: "Claire",
    next_op_name: "Mike"
  },
  {
    name: "Mike",
    next_op_name: "Rosa"
  },
  {
    name: "Rosa",
    next_op_name: "Peter"
  }
];

cy.ready(function() {
  var array = [];
  // iterate over info once
  for (var i = 0; i < info.length; i++) {
    array.push({
      group: "nodes",
      data: {
        id: info[i].name, // id is name!!!
        label: info[i].name
      }
    });
    array.push({
      group: "edges",
      data: {
        id: "e" + i,
        source: info[i].name,
        target: info[i].next_op_name,
        label: "e" + i
      }
    });
  }
  cy.add(array);
  cy.layout({
    name: "circle"
  }).run();
});
cy.on("mouseover", "node", function(event) {
  var node = event.target;
  node.qtip({
      content: "hello",
      show: {
        event: event.type,
        ready: true
      },
      hide: {
        event: "mouseout unfocus"
      }
    },
    event
  );
});

cy.unbind('click');
cy.bind('click', 'node, edge', function(event) {
  let target = event.target;
  if (target.isEdge()) {
    target.style('line-color', 'green');
  } else {
    target.style({
      'background-color': 'white',
      'border-color': 'blue'
    });
  }
});