const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');
const fse = require('fs-extra');

const expectedFiles = {
    csvcfiles: ['./csvc-helm/Chart.yaml', './csvc-helm/requirements.yml', './csvc-helm/values.yml', './csvc-helm/templates/_helpers.tpl'],
    eurekaregistry: ['./csvc-helm/templates/jhipster-registry.yml', './csvc-helm/templates/application-configmap.yml'],
    consulregistry: [
        './csvc-helm/templates/consul.yml',
        './csvc-helm/templates/consul-config-loader.yml',
        './csvc-helm/templates/application-configmap.yml',
    ],
    jhgate: [
        './jhgate-helm/templates/jhgate-deployment.yml',
        './jhgate-helm/templates/jhgate-service.yml',
        './jhgate-helm/Chart.yaml',
        './jhgate-helm/requirements.yml',
        './jhgate-helm/values.yml',
        './jhgate-helm/templates/_helpers.tpl',
    ],
    jhgateingress: ['./jhgate-helm/templates/jhgate-ingress.yml'],
    customnamespace: ['./namespace.yml'],
    jhconsole: [
        './csvc-helm/templates/jhipster-console.yml',
        './csvc-helm/templates/jhipster-logstash.yml',
        './csvc-helm/templates/jhipster-dashboard-console.yml',
        './csvc-helm/templates/jhipster-zipkin.yml',
    ],
    msmysql: [
        './msmysql-helm/Chart.yaml',
        './msmysql-helm/requirements.yml',
        './msmysql-helm/values.yml',
        './msmysql-helm/templates/_helpers.tpl',
        './msmysql-helm/templates/msmysql-deployment.yml',
        './msmysql-helm/templates/msmysql-service.yml',
    ],
    mspsql: [
        './mspsql-helm/Chart.yaml',
        './mspsql-helm/requirements.yml',
        './mspsql-helm/values.yml',
        './mspsql-helm/templates/_helpers.tpl',
        './mspsql-helm/templates/mspsql-deployment.yml',
        './mspsql-helm/templates/mspsql-service.yml',
    ],
    msmongodb: [
        './msmongodb-helm/Chart.yaml',
        './msmongodb-helm/requirements.yml',
        './msmongodb-helm/values.yml',
        './msmongodb-helm/templates/_helpers.tpl',
        './msmongodb-helm/templates/msmongodb-deployment.yml',
        './msmongodb-helm/templates/msmongodb-service.yml',
    ],
    msmariadb: [
        './msmariadb-helm/Chart.yaml',
        './msmariadb-helm/requirements.yml',
        './msmariadb-helm/values.yml',
        './msmariadb-helm/templates/_helpers.tpl',
        './msmariadb-helm/templates/msmariadb-deployment.yml',
        './msmariadb-helm/templates/msmariadb-service.yml',
    ],
    monolith: [
        './samplemysql-helm/Chart.yaml',
        './samplemysql-helm/requirements.yml',
        './samplemysql-helm/values.yml',
        './samplemysql-helm/templates/_helpers.tpl',
        './samplemysql-helm/templates/samplemysql-deployment.yml',
        './samplemysql-helm/templates/samplemysql-service.yml',
        './samplemysql-helm/templates/samplemysql-elasticsearch.yml',
    ],
    kafka: ['./samplekafka-helm/templates/samplekafka-deployment.yml', './samplekafka-helm/templates/samplekafka-service.yml'],
    jhgategateway: [
        './jhgate-helm/templates/jhgate-gateway.yml',
        './jhgate-helm/templates/jhgate-destination-rule.yml',
        './jhgate-helm/templates/jhgate-virtual-service.yml',
    ],
    applyScript: ['./helm-apply.sh', './helm-upgrade.sh'],
};

describe('JHipster Kubernetes Helm Sub Generator', () => {
    describe('only gateway', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway'],
                    adminPassword: 'meetup',
                    dockerRepositoryName: 'jhipsterrepository',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'jhipsternamespace',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files and content', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files and content', () => {
            assert.file(expectedFiles.jhgate);
            assert.fileContent('./jhgate-helm/requirements.yml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway and mysql microservice', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql-helm/requirements.yml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('mysql microservice with custom namespace and jhipster-console (with zipkin)', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['02-mysql'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'mynamespace',
                    monitoring: 'elk',
                    jhipsterConsole: true,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql-helm/requirements.yml', /name: mysql/);
        });
        it('creates expected jhipster-console files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.jhconsole);
            assert.fileContent('./csvc-helm/requirements.yml', /name: elasticsearch/);
        });
        it('creates expected namespace file', () => {
            assert.file(expectedFiles.customnamespace);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway and ingress', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    istio: false,
                    kubernetesServiceType: 'Ingress',
                    ingressType: 'gke',
                    ingressDomain: 'example.com',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected ingress files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.jhgateingress);
            assert.fileContent('./jhgate-helm/requirements.yml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('MySQL and PostgreSQL microservices without gateway', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['02-mysql', '03-psql'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it("doesn't creates gateway files", () => {
            assert.noFile(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql-helm/requirements.yml', /name: mysql/);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
            assert.fileContent('./mspsql-helm/requirements.yml', /name: postgresql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway, mysql, psql, mongodb, mariadb microservices', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway', '02-mysql', '03-psql', '04-mongo', '07-mariadb'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected gateway files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql-helm/requirements.yml', /name: mysql/);
        });
        it('creates expected psql files', () => {
            assert.file(expectedFiles.mspsql);
            assert.fileContent('./mspsql-helm/requirements.yml', /name: postgresql/);
        });
        it('creates expected mongodb files', () => {
            assert.file(expectedFiles.msmongodb);
            assert.fileContent('./msmongodb-helm/requirements.yml', /name: mongodb-replicaset/);
        });
        it('creates expected mariadb files', () => {
            assert.file(expectedFiles.msmariadb);
            assert.fileContent('./msmariadb-helm/requirements.yml', /name: mariadb/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('monolith application', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: ['08-monolith'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it("doesn't creates registry files", () => {
            assert.noFile(expectedFiles.eurekaregistry);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.monolith);
            assert.fileContent('./samplemysql-helm/requirements.yml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('Kafka application', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'monolith',
                    directoryPath: './',
                    chosenApps: ['09-kafka'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    jhipsterConsole: false,
                    kubernetesServiceType: 'LoadBalancer',
                    clusteredDbApps: [],
                })
                .on('end', done);
        });
        it('creates expected default files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.file(expectedFiles.kafka);
            assert.fileContent('./csvc-helm/requirements.yml', /name: kafka/);
            assert.fileContent('./samplekafka-helm/requirements.yml', /name: mysql/);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('mysql microservice with custom namespace and jhipster prometheus monitoring', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['02-mysql'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'mynamespace',
                    monitoring: 'prometheus',
                    kubernetesServiceType: 'LoadBalancer',
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
        });
        it('creates expected mysql files', () => {
            assert.file(expectedFiles.msmysql);
            assert.fileContent('./msmysql-helm/requirements.yml', /name: mysql/);
        });
        it('creates expected prometheus files', () => {
            assert.file(expectedFiles.csvcfiles);
            assert.fileContent('./csvc-helm/requirements.yml', /name: prometheus/);
            assert.fileContent('./csvc-helm/requirements.yml', /name: grafana/);
        });
        it('creates expected namespace file', () => {
            assert.file(expectedFiles.customnamespace);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });

    describe('gateway with istio', () => {
        beforeEach(done => {
            helpers
                .run(require.resolve('../generators/kubernetes-helm'))
                .inTmpDir(dir => {
                    fse.copySync(path.join(__dirname, './templates/compose/'), dir);
                })
                .withOptions({ skipChecks: true })
                .withPrompts({
                    deploymentApplicationType: 'microservice',
                    directoryPath: './',
                    chosenApps: ['01-gateway'],
                    dockerRepositoryName: 'jhipster',
                    dockerPushCommand: 'docker push',
                    kubernetesNamespace: 'default',
                    ingressDomain: 'example.com',
                    clusteredDbApps: [],
                    istio: true,
                })
                .on('end', done);
        });
        it('creates expected registry files', () => {
            assert.file(expectedFiles.eurekaregistry);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected service gateway files', () => {
            assert.file(expectedFiles.jhgate);
            assert.file(expectedFiles.csvcfiles);
        });
        it('creates expected routing gateway and istio files', () => {
            assert.file(expectedFiles.jhgategateway);
        });
        it('create the apply script', () => {
            assert.file(expectedFiles.applyScript);
        });
    });
});
