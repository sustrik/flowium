flowiumConfig = {
    URL: "https://flowium.com",
    services: [
        {
            name: "sandbox",
            type: "GitHub",
            clientID: "d027578d9cca180f9e0e",
            gatekeeperURL: "https://flowium.herokuapp.com",
            repository: "sustrik/flowium-sandbox",
            templatePath: "/",
        },
        {
            name: "gitea-test",
            type: "Gitea",
            root: "https://try.gitea.io",
            applicationID: "",
            respository: "flowium/flowium-sandbox",
            templatePath: "/",
            token: "7c270a276f42c3631645224e01bada02891bf925",
            editable: true,
        },
        {
            name: "gitlab-test",
            type: "GitLab",
            root: "https://gitlab.com",
            applicationID: "4dbe6da72b8954701424c1439519d1debe60211f7294547e111787b1e340544b",
            project: "sustrik/flowium-sandbox",
            templatePath: "/",
            editable: true,
        },
    ]
}
