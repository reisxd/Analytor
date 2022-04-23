window.onload = () => {
    fetch('http://localhost/api/telemetry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': navigator.userAgent
        },
        body: JSON.stringify({
            token: '',
            url: window.location.href
        })
    });
}

window.onerror = (msg, url, line, col, error) => {
    fetch('http://localhost/api/errorHandler', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: '',
            error: {
                message: msg,
                source: url,
                line: line,
                column: col,
                errorObject: error
            }
        })
    });
    return false;
}