

const cds = require("@sap/cds");
const JobSchedulerClient = require('@sap/jobs-client');
const xsenv = require('@sap/xsenv');

async function triggerMaterialreplicationJob(req) {
  const services = xsenv.getServices({
    jobscheduler: { tag: 'jobscheduler' },
    uaa: { tag: 'xsuaa' }
  });

  const { ipMatnrs, ipMode, ipNotes } = req.data;
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
    active: true,

    schedules: [
      {
        startTime: istTime,
        description: "Run once after 5 seconds",
        active: true,
        type: "once",
        time: istTime,
        data: {
          // ipMatnrs: ['300.FIN.0009.212','300.FIN.0009.222']
          ipJobID: jobName
        }
      }
    ]
  };
  return new Promise(async (resolve, reject) => {

    //check the currentLevel of Approval. Create job when is approved by last level
    if (ipMode.includes("Change Req")) {

      const match = ipMode.match(/\d+/);
      let ipModeInt;
      if (match) {
        ipModeInt = parseInt(match[0], 10);

      }
      let oChangeRequest = await tx.run(SELECT.one.from('litemdg.Change_Request').where({ REQUEST_NUMBER: ipModeInt }));

      let sCurrentLevel = oChangeRequest.CurrentLevel;
      let sLastApprovalLevel = oChangeRequest.TotalApproverLevel;
      let sModel = oChangeRequest.Model;
      let sCommentHist = oChangeRequest.Notes === null ? ipNotes : oChangeRequest.Notes + "\n" + ipNotes;
      let aApproverMatrixHeader = await tx.run(SELECT.one.from('litemdg.ApproverMatrix')
        .where({ Model: sModel }));

      let aApproverList = await tx.run(SELECT.from('litemdg.ApproverList')
        .where({ parent_ID: aApproverMatrixHeader.ID }));
      debugger;

      let aCurrentApproverDetail = aApproverList.find(iList => iList.Level === sCurrentLevel);
      if (sLastApprovalLevel === sCurrentLevel) {

        scheduler.createJob({ job: jobData }, async (err, result) => {
          if (err) return reject(err);
          const aResults = [];
          for (const matnr of ipMatnrs) {
            const successEntry = {
              ID: cds.utils.uuid(),
              JobID: jobName,
              MATNR: matnr,
              STATUS: "Queued",
              REPLICATION_MODE: ipMode,
              Message: "Replication in Progress",
              Timestamp: new Date(),
              REPLICATED_BY: req.user.id
            };

            await tx.run(
              INSERT.into("litemdg.ReplicationReport").entries(successEntry)
            );
            if (ipMode.includes("Change Req")) {

              const match = ipMode.match(/\d+/);
              let ipModeInt;
              if (match) {
                ipModeInt = parseInt(match[0], 10);

              }

              await tx.run(
                UPDATE("litemdg.Change_Request").set({
                  Replication_status: "Completed",
                  Overall_status: "Approved",
                  ApprovedByLevel: sCurrentLevel,
                  Approved_By: aCurrentApproverDetail.Approver_ID,
                  Notes: sCommentHist
                }).where({ REQUEST_NUMBER: ipModeInt })
              );
            }
            aResults.push(successEntry);
          }


          resolve(aResults);
          // scheduler.runJob({ jobId: result._id }, (err2) => {
          //   if (err2) return reject(err2);
          //   resolve("Job triggered.");
          // });
        });
      } else {
        //Assign the NextApprover
        let sNextLevel = "L" + (parseInt(oChangeRequest.CurrentLevel.match(/\d+/)) + 1);
        let aNextApproverDetail = aApproverList.find(iList => iList.Level === sNextLevel);
        let aCurrentApproverDetail = aApproverList.find(iList => iList.Level === sCurrentLevel);
        let sCurrentApproverID = aNextApproverDetail.Approver_ID;
        let sCurrentApproverName = aNextApproverDetail.Approver_Name;
        let sLevel = aNextApproverDetail.Level;

        await tx.run(UPDATE('litemdg.Change_Request').where({ REQUEST_NUMBER: ipModeInt }).set(
          {
            Approved_By: aCurrentApproverDetail.Approver_ID,
            ApprovedByLevel: sCurrentLevel,
            CurrentApproverID: sCurrentApproverID,
            CurrentApproverName: sCurrentApproverName,
            CurrentLevel: sLevel,
            Notes: sCommentHist
          }
        ));

        resolve("Assinged to Next Approver");

      }
    }
    else {
      scheduler.createJob({ job: jobData }, async (err, result) => {
        if (err) return reject(err);
        const aResults = [];
        for (const matnr of ipMatnrs) {
          const successEntry = {
            ID: cds.utils.uuid(),
            JobID: jobName,
            MATNR: matnr,
            STATUS: "Queued",
            REPLICATION_MODE: ipMode,
            Message: "Replication in Progress",
            Timestamp: new Date(),
            REPLICATED_BY: req.user.id
          };

          await tx.run(
            INSERT.into("litemdg.ReplicationReport").entries(successEntry)
          );
          if (ipMode.includes("Change Req")) {

            const match = ipMode.match(/\d+/);
            let ipModeInt;
            if (match) {
              ipModeInt = parseInt(match[0], 10);

            }

            await tx.run(
              UPDATE("litemdg.Change_Request").set({
                Replication_status: "Completed",
                Overall_status: "Approved",
                Approved_By: aCurrentApproverDetail.Approver_ID,
                Notes: sCommentHist
              }).where({ REQUEST_NUMBER: ipModeInt })
            );
          }
          aResults.push(successEntry);
        }


        resolve(aResults);

      });
    }


  });

}




module.exports = {
  triggerMaterialreplicationJob
}
