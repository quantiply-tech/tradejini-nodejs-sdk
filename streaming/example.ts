import NxtradStream, { StatusMessage } from "./lib"
import axios from "axios";

function connCb(t: NxtradStream, msg: StatusMessage) {    
    if (msg.s == "connected") {
        var events = ["orders", "positions", "trades"]
        var tokens: string[] = ["-1_NSE"]
        t.subscribeL1(tokens)
        t.subscribeGreeks(tokens)
        t.subscribeL1Snapshot(tokens)
        t.subscribeL2(tokens)
        t.subscribeL2Snapshot(tokens)
        t.subscribeOptionChain("IDX_-1_NSE", "2023-05-04")
        t.subscribeOptionChain("IDX_-20_NSE", "2023-05-04")
        t.subscribeEvents(events)
        t.subscribeOHLC(tokens, "1M") // 1M,5M,30M
    }
    if (msg.s == "closed" && msg.reason !== "Unauthorized Access") {
        setTimeout(() => {
            t.reconnect();
        }, 5000);
    }
}

async function getAccessToken(host: string, apiKey: string, password: string, dobOrPan: string) {
    const url = `https://${host}/v2/api-gw/oauth/individual-token`;
    const body = {
        "password": password,
        "dobOrPan": dobOrPan
    }

    const data = Object.keys(body)
        .map((key) => `${key}=${encodeURIComponent(body[key])}`)
        .join('&');

    const headers = {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json"
    }
    const response = await axios.post(url, data, {
        headers: headers,
        timeout: 20000
    });
    return response.data;
}

function streamCb(t: NxtradStream, msg: any) {
    console.log(JSON.stringify(msg))
}

async function main() {
    const host = "xxxxxxxxx"
    const apiKey = "xxxxxxxxxxxxxxxxxx"
    const password = "xxxxxxxxx"
    const dob = "xxxx"
    const accessToken = await getAccessToken(host, apiKey, password, dob);

    const authToken = `${apiKey}:${accessToken["access_token"]}`;

    const stream = new NxtradStream(host, connCb, streamCb); //By default Symbol Store will be loaded.
    // // const stream = new NxtradStream(host, connCb, streamCb, false); pass as false if not required
    await stream.connect(authToken)
}

main()