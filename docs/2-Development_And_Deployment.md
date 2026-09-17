# SD-RI Development Workflow

## Prerequisite

- Install [git](https://git-scm.com/download/mac)
- Generate private [key](https://docs.tritondatacenter.com/public-cloud/getting-started/ssh-keys/generating-an-ssh-key-manually/manually-generating-your-ssh-key-in-mac-os-x)

## Accessing the git server
Your mentor should've given you user and password through your email to access the git server.

```sh
ssh <username>@git.savantdegrees.com
enter password
```
## Cloning project
After accesing the server, you should be able to clone the project.

```sh
git clone ssh://<username>@git.savantdegrees.com/var/git/eunoia-engagexp
```

## Switch your branch to develop
For developing purposes, we mainly use the develop branch. You can make your changes directly in this branch or make a new feature branch.

```sh
git checkout develop
```

## Commit your changes
After developing the feature or fixing a bug, you should commit your changes along with the ticket from chili(if any).

```sh
git add .
git commit -m "#<your_ticket> - <things that you did>"
```

## Deploy
### Connecting to staging server
To deploy this application you need an access to the deployment server. You can ask the senior developer to grant the access from your laptop by sending them the your public key which you can access with this command.

```sh
cat ~/.ssh/id_rsa.pub
```

After gaining access to the deployment server, you should be able to ssh to the server by issuing this command.
```sh
ssh <user>@host
```

#### (Optional) Config file
You can also specify a config file to connect easily. First you need to go to /Users/<your_user>/.ssh and then make and edit the config file with your favourite code editor.
```sh
cd /Users/<your_user>/.ssh
touch config
```
Enter the following config
```sh
Host <any_name_you_prefer> (ex. engagexp)
    HostName <IP/hostname of your server>
    User <username>
    Port <typically will be 22 for ssh>
    IdentityFile <path of your ssh private key>
```
After editing the config file you can save and exit. Now you can connect with staging server with this command.
```sh
ssh engageXP
```

### Building your vue app
Build your vue app to optimize the performance and compile it to a single index.html file with this command.

```sh
npm run build
```

After building your app, there should be a "dist" folder which contain your finished app.

### Publish your changes to staging server
1. You could have node installed on the staging server and build the files there.
2. Or build the files on your local then move the build-ed files to the staging server (command below)

```sh
rsync -av dist/* <hostname>:/var/www/eunoia-engagexp
```