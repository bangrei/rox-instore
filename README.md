# SD Design System

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production / live
```
npm run build-live
```

### Compiles and minifies for staging
```
npm run build-staging
```

### Lints and fixes files
```
npm run lint
```

### Repository branches and deployment
```
development branch			: develop
master branch				: master (tagging done here)
staging branch				: staging
live (no specific branch)	: based of 'master' branch (with certain tag version)

1. Development of feature will based off 'develop' branch 
2. Tagging/versioning will be on 'master' branch using npm version following semver (semantic versioning) 
	a. npm version patch => for patch
	b. npm version minor => for non-breaking changes
	c. npm version major => for breaking changes 
2. Staging environment 'staging' will pull changes from 'master' branch and will always 'up to date' with 'master' branch
3. Deployment to live will be from master's branch tag version - steps starting from no.2 is to be done by 1 person in charge

Deployment to staging server (starting branch 'develop' in your local) :
1. git pull
2. git push
3. git checkout master
4. git pull origin develop
5. npm version [patch, minor, major] (depending on type of changes)
6. git push
7. git checkout staging
8. git pull origin master
9. git push
10. npm run build-staging (build files/assets using .env.staging configuration)
11. rsync -avp [location of the build-ed files/folder] <host_on_config>:/var/www/bfm-staging (ex. rsync -avp dist/* bfmStaging:/var/www/bfm-staging)

Deployment to live server (BFM EU FE and BE are on the same server which is hosted and owned by EU, SD responsible for FE deployment) :
1. ssh to intermediary server from EU (bastion server) -> ssh ubuntu@54.255.37.242 (you'll need access from EU's developer if you don't have access)
2. ssh to live BFM EU server -> ssh ubuntu@172.32.6.55
3. change directory into /var/www/bfm -> cd /var/www/bfm
4. fetch updates from git -> git fetch
5. checkout into tag version which is ready for production -> git checkout <production_ready_tag_version>
6. build the assets/files -> npm run build-live (this will generate new assets/files in /dist folder)
```