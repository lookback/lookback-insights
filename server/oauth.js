ServiceConfiguration.configurations.upsert(
  { service: "google" },
  {
    $set: {
      clientId: "86246956151-kgqja5r626110laqcn27g1vikq6rmh9i.apps.googleusercontent.com",
      loginStyle: "popup",
      secret: "TQkuE92slqLbVendCtE3gw0f",
      hd: "lookback.io"
    }
  }
);

Accounts.validateNewUser(function (user) {
    if(user.services.google.email.match(/lookback\.io$/)) {
        return true;
    }
    throw new Meteor.Error(403, "You must sign in using a lookback.io account");
});
