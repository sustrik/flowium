flowiumConfig = {
    URL: "https://flowium.com",
    services: [
        {
            name: "gitlab",
            type: "GitLab",
            root: "https://gitlab.com",
            applicationID: "4dbe6da72b8954701424c1439519d1debe60211f7294547e111787b1e340544b",
            project: "sustrik/flowium-sandbox",
            templatePath: "/",
        },
        {
            name: "github",
            type: "GitHub",
            clientID: "d027578d9cca180f9e0e",
            gatekeeperURL: "https://flowium.herokuapp.com",
            repository: "sustrik/flowium-sandbox",
            templatePath: "/",
        },
    ]
}
