<template>
    <div ref="googleButton" class="page__icons__icon custom"><i class="custom-google"></i> Google</div>
</template>
<script>
export default {
    props: {
        googleWebAppId: {
            type: String,
            default: "",
        }
    },
    created() {
        let self = this;
        // to prevent sending null client id to google
        console.log(self.googleWebAppId)
            window.gapi.load('auth2', function () {
                const auth2 = window.gapi.auth2.init({
                    client_id: self.googleWebAppId,
                    cookiepolicy: 'single_host_origin'
                });
                auth2.attachClickHandler(self.$refs.googleButton, {}, function (googleUser) {
                    self.$emit('done', googleUser)
                }, function (error) {
                    console.log(error)
                });
            });

    }
}
</script>