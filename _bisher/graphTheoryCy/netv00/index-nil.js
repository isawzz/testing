const testData = {
    nodes: [
        {
            id: '0',
            x: 300,
            y: 200
        },
        {
            id: '1',
            x: 500,
            y: 200
        },
        {
            id: '2',
            x: 400,
            y: 400
        }
    ],
    links: [
        {
            source: '0',
            target: '2'
        },
        {
            source: '1',
            target: '2'
        }
    ]
}

const netv = new NetV({
    container: document.getElementById('main')
});

netv.backgroundColor({ r: .5, g: .1, b: 0.2, a: 1 }); //muehsam!

netv.data(testData)
netv.draw()
