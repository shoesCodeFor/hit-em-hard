const axios = require("axios");

axios.interceptors.request.use(function (config) {
    config.metadata= { startTime:  new Date() };
    return config;
}, error => { return Promise.reject(error)});

axios.interceptors.response.use(function (response) {
    response.config.metadata.endTime = new Date();
    response.duration = response.config.metadata.endTime - response.config.metadata.startTime;
    console.log('Response Latency: ' + response.duration);
    requestCount++;
    latencyTotal += response.duration;
    latencyAvg = latencyTotal/requestCount;
    console.log('Latency Avg: ' + latencyAvg);
    return response;
}, error => {
    error.config.metadata.endTime = new Date();
    error.duration = error.config.metadata.endTime - error.config.metadata.startTime;
    requestCount++;
    latencyTotal += error.duration;
    latencyAvg = latencyTotal/requestCount;
    return Promise.reject(error);
});

class LoadTester{
    constructor(urls, numberOfRequests){
        this.urls = urls;
        this.numberOfRequests = numberOfRequests;
    }
    okays = 0;
    latencyAvg = 0;
    latencyTotal = 0;
    requestCount = 0;
    errors = [];
    
    fireRequests = async (iterations) => {
        let total = 0;
        while (total < iterations){
            total++;
            await setTimeout(() => {
                let startTime = new Date();
                const URL = "http://localhost:4001/v1/checkin"
                axios.get(URL).then(res => {
                    console.log(`Request #: ${requestCount}`);
                    const { status, data} = res;
                    console.log(`Status Code ${status}`);
                    okays++;
                    console.log(`Body`, data);
                    console.log('Number of errors: ' + errors.length);
                }).catch(err => {
                    console.log(`Request #: ${requestCount}`);
                    console.log(err.message);
                    errors.push(err.message);
                    console.log('Number of errors: ' + errors.length);
                });
            }, Math.floor(Math.random() * 1000));
        } 
    }
}

export default LoadTester;