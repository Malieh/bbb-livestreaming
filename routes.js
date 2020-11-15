var exec = require('child_process').exec;
const { platform } = require('os');
var portfinder = require('portfinder');

var link, rtmpUrl;

var platformrtmpUrls = {
    facebook: "rtmps://live-api-s.facebook.com:443/rtmp/",
    youtube: "rtmp://a.rtmp.youtube.com/live2/",
    instagram: "",
    twitter: "",
    twitch: "rtmp://live-mad.twitch.tv/app/",
    linkedin: ""
}

var appRouter = function (app) {
    app.post("/", function (req, res) {
        var { platforms, secretKeys, meetingID } = req.body

        for (pf in platforms) {
            portfinder.getPort(function (err, port) {
                console.log(port)
                if (err) res.status(400).send(err)
                else {
                    rtmpUrl = platformrtmpUrls[pf] + secretKeys[pf]

                    console.log(rtmpUrl)
                   
                    exec("node /home/ubuntu/obmeet-bbb-streamer/meeting-streamer/meeting-id-generator/index.js '" + meetingID + "' | tee /dev/null", (err, stdout, stderr) => {
                        link = stdout.substring(0, stdout.length - 1)
                        var ll = "node /home/ubuntu/obmeet-bbb-streamer/meeting-streamer/liveRTMP.js '" + link + "' '" + port + "' | tee /dev/null"
                        console.log(ll)
                        exec(ll, (err, stdout, stderr) => {
                            if (err) console.log("h"); // res.status(400).send(link)
                            else console.log('hh'); //  res.status(200).send(link)
                        })
                        console.log(link);
                        var cc = "node /home/ubuntu/obmeet-bbb-streamer/meeting-streamer/ffmpegServer.js '" + port + "'  '" + rtmpUrl + "' | tee /dev/null"
                        console.log(cc)

                        try {
                            exec(cc, (err, stdout, stderr) => {
                                if (!err) console.log("Ok")
                            })
                        } catch (error) {
                            console.log(error);
                        }

                        console.log("Ok")

                    })

                }

            });


        }


        res.status(200).send("Ok")

    });
}

module.exports = appRouter;