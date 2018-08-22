flowiumConfig = {
    URL: "https://flowium.com",
    backends: {
        'FlowiumSandbox': {
            type: "GitHub",
            URL: "https://api.github.com",
            clientID: "d027578d9cca180f9e0e",
            gatekeeperURL: "https://flowium.herokuapp.com",
            repository: "sustrik/flowium-sandbox",
            processPath: "/",
        },
        'gitlab-test': {
            type: "GitLab",
            URL: "https://gitlab.com",
            applicationID: "4dbe6da72b8954701424c1439519d1debe60211f7294547e111787b1e340544b",
            repository: "sustrik/flowium-sandbox",
            processPath: "/",
            editable: true,
        },
        'gitea-test': {
            type: "Gitea",
            URL: "https://try.gitea.io",
            applicationID: "",
            repository: "flowium/flowium-sandbox",
            processPath: "/",
            token: "7c270a276f42c3631645224e01bada02891bf925",
            editable: true,
        },
    }
}
