const fs = require('fs');

const routeFunction = (req,res) =>{
    const url = req.url;
    const method= req.method;
    if(url === '/'){
        res.write('<html>');
        res.write('<head><title>dgf</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        return res.end();
    }
    if(url === '/message' && method === 'POST'){
        const body = [];
        // PARSING THE DATA USER SEND AND STORE THEM IN A FILE
        // USE EVENT LISTENER
        req.on('data',(chunk)=>{
        body.push(chunk);
        })
        req.on('end',()=>{
            const parseData = Buffer.concat(body).toString();
            const message = parseData.split('=')[1];
           fs.writeFileSync('example1',message);
        })
        return res.end();
    }
    res.write('<html>');
    res.write('<head><title>dgf</title></head>');
    res.write('<body><h4>'+url+'</h4>'+method+'</body>');
    res.write('</html>');
    res.end();
}

module.exports.handler = routeFunction;
module.exports.Testpara = 'hard coded text';
