let sigint = null;

setInterval(() => {
    console.log("\rProcess up for " + process.uptime());
}, 1e3);

process.on("SIGINT", () => {
    if (!sigint) {
        console.error("Ctrl+C pressed, please press again in less than 2 seconds to exit");
    }
    sigint = sigint ? process.exit(130) : setTimeout(() => sigint = null, 2000);
});
