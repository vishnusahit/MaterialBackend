

const cds = require("@sap/cds");
const JobSchedulerClient = require('@sap/jobs-client');
const xsenv = require('@sap/xsenv');

async function triggerMaterialreplicationJob(req) {
  const services = xsenv.getServices({
    jobscheduler: { tag: 'jobscheduler' },
    uaa: { tag: 'xsuaa' }
  });

  const { ipMatnrs } = req.data;
  console.log("services log : " + JSON.stringify(services));
  const options = {
    baseURL: services.jobscheduler.url, // like https://scheduler-service.cfapps.eu10.hana.ondemand.com
    oauth: {
      clientId: services.uaa.clientid,
      clientSecret: services.uaa.clientsecret,
      tokenURL: services.uaa.url + '/oauth/token'
    }
  };

  const scheduler = new JobSchedulerClient.Scheduler(options);
  const tx = cds.transaction(req);
  // const jobName = `replicate-${Date.now()}`;
  const istTime = new Date(Date.now() + 6000).toISOString(); // run 5 sec from now
//   const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
// const istTime = new Date(Date.now() + istOffset + 5000).toISOString();
// console.log(istTime);

  const jobName = `MaterialJob_${istTime.replace(/[-:.TZ]/g, "")}`;
  const jobData = {
    name: jobName,
    action: "https://bosch-global-software-technologies-private-limited-bgsw6c82f079.cfapps.eu10-004.hana.ondemand.com/odata/v4/litemdg/replicateToS4Hana", // your background route
    httpMethod: "POST",
    active : true,
    
    schedules: [
      { startTime: istTime,  
        description: "Run once after 5 seconds",
        active : true,
        type : "once",
        time : istTime,
        data: {
          // ipMatnrs: ['300.FIN.0009.212','300.FIN.0009.222']
          ipJobID : jobName
        }
      }
    ]
  };
  return new Promise((resolve, reject) => {
    scheduler.createJob ({ job: jobData },async (err, result) => {
      if (err) return reject(err);
      const aResults = [];
      for (const matnr of ipMatnrs) {
        const successEntry = {
          ID: cds.utils.uuid(),
          JobID : jobName,
          MATNR: matnr,
          STATUS: "Queued",
          Message: "Replication in Progress",
          Timestamp: new Date(),
          REPLICATED_BY: req.user.id
        };

  await tx.run(
    INSERT.into("litemdg.ReplicationReport").entries(successEntry)
  );
  aResults.push(successEntry);
      }
      
      
      resolve(aResults);
      // scheduler.runJob({ jobId: result._id }, (err2) => {
      //   if (err2) return reject(err2);
      //   resolve("Job triggered.");
      // });
    });
  });

}




module.exports = {
  triggerMaterialreplicationJob
}
