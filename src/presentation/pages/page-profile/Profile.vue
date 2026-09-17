<template>
	<layout-variant-two :show-loading-screen="loading">
		<template v-slot:body>
            <div class="profile-container" v-if="!isEmpty(customer) && !loading">
                <div class="profile-account-wrapper">
                    <div class="profile-label">
                        <span class="home-link">Home</span>
                        <i class="material-icons">chevron_right</i>
                        <span>Profile</span>
                    </div>
                    <div class="profile-account">
                        <div class="profile-avatar modal-trigger" @click="toggleAvatars(true)">
                            <img v-if="currentAvatar" :src="require('@/assets/avatars/' + currentAvatar + '.png')" width="120" height="120"/>
                            <span v-else class="material-icons-outlined">person</span>
                        </div>
                        <div class="profile-account-content">
                            <div class="profile-name">{{ customerFullname }} <i @click="toggleForm(true)" class="material-icons modal-trigger">edit</i></div>
                            <div class="profile-email">{{ customer.email }}</div>
                            <div class="account-actions">
                                <span class="account-registered">{{ membershipDateInfo }}</span>
                                <span @click="toggleQR(true)" class="account-widget material-icons modal-trigger">qr_code</span>
                                <router-link to="/my-order" class="account-widget block material-icons">history</router-link>
                                <router-link to="/saved-cards" class="account-widget block material-icons">credit_card</router-link>
                                <router-link to="/points" class="account-widget block material-icons">workspace_premium</router-link>
                                <!-- <router-link to="/my-order" class="account-registered plain">
                                    <i class="material-icons">history</i> Order History
                                </router-link>
                                <router-link to="/saved-cards" class="account-registered plain">
                                    <i class="material-icons-outlined">credit_card</i> Saved Cards
                                </router-link>
                                <router-link to="/points" class="account-registered plain">
                                    <i class="material-icons-outlined">workspace_premium</i> Rewards
                                </router-link> -->
                                <span @click="logout" class="account-registered pull-right outlined">
                                    <i class="material-icons">logout</i> Log out
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="profile-features">
                    <div class="page-title">Adventure Log</div>
                    <div class="page-subtitle uppercase">Achievements</div>
                    <div class="tags-list" v-if="nudgeAchievements?.length > 0">
                        <div class="tag-item no-action">
                            <div class="tag-icon">
                                <img :src="require('@/assets/avatars/fledgling.png')" width="60" height="60" alt="Fledging"/>
                            </div>
                            <div class="tag-title">
                                <span>FLEDGLING</span>
                                <span class="tag-subtitle">Created an account in the R.O.X. Community</span>
                            </div>
                        </div>
                        <div v-for="ach in nudgeAchievements"
                            :key="ach.id"
                            :class="['tag-item', {'disabled': !nudgesInfo.achievements?.map((it) => it.id).includes(ach.id)}]"
                            @click="clickNudge(ach)">
                            <div class="tag-icon">
                                <img :src="nudgeAvatar(ach)" class="modal-trigger" width="60" height="60" :alt="ach.name"/>
                            </div>
                            <div class="tag-title modal-trigger">
                                <span class="modal-trigger">{{ ach.name }}</span>
                                <span v-if="ach.description" class="tag-subtitle modal-trigger retain-text" v-html="ach.description"></span>
                            </div>
                        </div>
                        <!-- <div :class="['tag-item', {'disabled': !nudgesInfo.goodNeighbor}]">
                            <div class="tag-icon">
                                <img :src="require('@/assets/avatars/good-neighbor.png')" width="60" height="60" alt="Good Neighbor"/>
                            </div>
                            <div class="tag-title">
                                <span>GOOD NEIGHBOR</span>
                                <span class="tag-subtitle">Purchased food or drinks from a partner merchant</span>
                            </div>
                        </div>
                        <div :class="['tag-item', {'disabled': !nudgesInfo.geodasher}]">
                            <div class="tag-icon">
                                <img :src="require('@/assets/avatars/geodasher.png')" width="60" height="60" alt="Geodasher"/>
                            </div>
                            <div class="tag-title">
                                <span>GEODASHER</span>
                                <span class="tag-subtitle">Completed the R.O.X. GeoDash 2026</span>
                            </div>
                        </div> -->
                    </div>
                    <div v-if="fetchingTags" class="tags-list shimmer">
                        <div v-for="content in fetchingTagsLoadingContent"
                            :key="content.index"
                            class="tag-item">
                            <div class="tag-icon"></div>
                            <div class="tag-title">
                                <div class="shimmer-title"></div>
                                <div class="tag-subtitle"></div>
                            </div>
                        </div>
                    </div>
                    <div v-if="!nudgeAchievements?.length" class="tags-empty">
                        <i v-if="!fetchingTags" class="material-icons">workspace_premium</i>
                        <span v-if="!fetchingTags">Keep it up.<br/>More achievements are waiting for you.</span>
                    </div>
                    <!-- <div class="page-subtitle uppercase">R.O.X. GeoDash 2026</div> -->
                    <div class="tag-groups" 
                        v-for="(tag, index) in tagsDisplay" 
                        :key="index">
                        <div class="group-name uppercase">{{ tag.name }}</div>
                        <div class="tags-list">
                            <div v-for="nudge in tag.nudges"
                                :key="nudge.id"
                                :class="['tag-item modal-trigger', {'disabled': !['READ','CLAIMED'].includes(nudge.status)}]"
                                @click="clickNudge(nudge)">
                                <div class="tag-icon">
                                    <img :src="nudgeAvatar(nudge)" class="modal-trigger" width="60" height="60" :alt="nudge.name"/>
                                </div>
                                <div class="tag-title modal-trigger">
                                    <span class="clamps modal-trigger">{{ nudge.name }}</span>
                                    <div class="tag-subtitle clamps modal-trigger retain-text" v-if="nudge.description" v-html="nudge.description"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <ContactUs/>
                <div :class="['avatars-modal', {'active': showAvatars}]">
                    <span @click="toggleAvatars(false)" class="close-modal">&times;</span>
                    <div class="selected-avatar">
                        <img v-if="selectedAvatar" :src="require('@/assets/avatars/' + selectedAvatar + '.png')" width="120" height="120"/>
                        <i v-else class="material-icons-outlined">person</i>
                    </div>
                    <div class="avatar-modal-text">Select profile icon</div>
                    <div class="avatars">
                        <img v-for="avatar in avatars" 
                            :key="avatar" 
                            :src="require('@/assets/avatars/' + avatar + '.png')"
                            :class="{'selected': avatar == selectedAvatar}"
                            @click="selectedAvatar = avatar" 
                            width="120" height="120"/>
                    </div>
                    <button @click="saveAvatar" class="save-avatar-btn">Save Changes</button>
                </div>
                <div :class="['avatars-modal', {'active': showQR}]">
                    <span @click="toggleQR(false)" class="close-modal">&times;</span>
                    <div class="avatar-modal-title">{{ customerFullname }}</div>
                    <div class="avatar-modal-text">Member {{ customer?.id }}</div>
                    <div class="qr-code">
                        <qr-code :text="qrText"></qr-code>
                    </div>
                    <img class="logo-footer" width="90" height="50" alt="rxc logo" :src="require('@/assets/images/rox-logo-2025.jpeg')">
                </div>
                <div :class="['avatars-modal', {'active': showNudges}]">
                    <span @click="toggleNudges(false)" class="close-modal">&times;</span>
                    <div class="nudges-grid" v-if="activeTag">
                        <home-nudge-card
                            v-for="nudge in activeTag.nudges" :key="nudge.id"
                            :nudge="nudge"
                        />
                    </div>
                </div>
                <div :class="['avatars-modal', {'active': showNudgeDetails}]">
                    <span @click="toggleShowNudgeDetails(false)" class="close-modal">&times;</span>
                    <div class="surprise-content" v-if="clickedNudge && isSurprise">
                        <img class="surprise-image" :src="nudgeAvatar(clickedNudge)" width="60" height="60" :alt="clickedNudge.name"/>
                        <span class="surprise-name retain-text" v-html="clickedNudge.name"></span>
                        <span class="retain-text" v-html="clickedNudge.description"></span>
                        <span v-if="surprise && surprise.status == 'CLAIMED'">Already claimed!</span>
                        <img v-else class="surprise-qr" :src="qrImageSrc" />
                        <span v-if="surprise && surprise.status != 'CLAIMED'" class="retain-text" v-html="surpriseDescription"></span>
                        <router-link v-if="surprise && surprise.status != 'CLAIMED'" class="surprise-btn" :to="'/surprise/' + clickedNudge.id">Claim Now</router-link>
                    </div>
                    <home-nudge-card :nudge="clickedNudge" v-else-if="clickedNudge && !isSurprise"/>
                </div>
                <div :class="['avatars-modal', {'active': showForm}]">
                    <span @click="toggleForm(false)" class="close-modal">&times;</span>
                    <div class="inputs">
                        <div class="input-con" data-label="First Name*" data-sublabel="Required">
                            <input type="text" v-model="firstName">
                        </div>
                        <div class="input-con" data-label="Last Name*" data-sublabel="Required">
                            <input type="text" v-model="lastName">
                        </div>
                        <div class="input-con" data-label="Date of Birth (DD/MM/YYYY)">
                            <input type="date" v-model="dateOfBirth" placeholder="DD/MM/YYYY">
                        </div>
                        <div class="form-group">
                            <div class="label">Gender</div>
                            <div class="radio-list left-radio">
                                <div class="radio" v-for="radio in genders" :key="radio.name" @click="gender = radio.value">
                                    <input name="gender" type="radio" :checked="radio.value == gender">
                                    <span class="radio-label">{{ radio.name }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="input-con" data-label="Email Address">
                            <input type="email" v-model="email" readonly>
                        </div>
                        <div class="input-con" data-label="Phone Number">
                            <input type="text" v-model="phone">
                        </div>
                        <div class="form-group">
                            <div class="checkbox">
                                <input :checked="marketingEmails == true" name="marketingEmails" type="checkbox" v-model="marketingEmails">
                                <span class="checkbox-label">Subscribe to R.O.X Community Newsletters & notifications</span>
                            </div>
                        </div>
                    </div>
                    <button @click="save" class="save-avatar-btn">Save Changes</button>
                    <div class="save-avatar-btn outlined" @click="toggleDeleteAccount(true)">Delete Account</div>
                </div>
            </div>
            <base-modal :show="askDeleteAccount">
                <template v-slot:header>
                    <div class="modal-header header-flex">
                        <span class="material-icons-outlined modal-close-btn" @click="toggleDeleteAccount(false)">close</span>
                        <h3>Confirmation</h3>
                    </div>
                </template>
                <template v-slot:body>
                    <div class="modal-body">
                        <p>Account deletion is irreversible and your account will no longer be accessible.</p>
                        <p>Would you like to continue?</p>
                    </div>
                    <div class="modal-footer">
                        <div class="actions">
                            <div class="action-button light" @click="toggleDeleteAccount(false)">Cancel</div>
                            <div class="action-button" @click="deleteMyAccount()">Delete Account </div>
                        </div>
                    </div>
                </template>
            </base-modal>
		</template>
		<template v-slot:footer>
			<!-- <base-footer-nav :active-footer-id="activeFooterNavId"></base-footer-nav> -->
            <base-side-nav v-if="!loading" :active-index="0"/>
		</template>
	</layout-variant-two>
</template>

<script>
import LayoutVariantTwo from "@/components/layout/LayoutVariantTwo.vue";
import utility from "@/presentation/mixins/utility.js";
import { isEmpty } from "lodash";
import moment from "moment-timezone";
import { getEunoiaCustomerDetails } from "@/connector/v4/customerConnector";
import VueQRCodeComponent from 'vue-qrcode-component';
import { homeService, surpriseService } from "@/bloc/services";
import ContactUs from "../page-start/components/ContactUs.vue";
import HomeNudgeCard from "../page-feeds/components/HomeNudgeCard.vue";
import nudgeConnector from "@/connector/v4/nudgeConnector";
import Nudge from "@/bloc/model/nudge";
const qrCode = VueQRCodeComponent;
export default {
	name: "ProfilePage",
	mixins: [utility],
	components: {
		LayoutVariantTwo,
        qrCode,
        ContactUs,
        HomeNudgeCard,
	},
	data() {
		return {
			customer: {},
			loading: true,
			activeFooterNavId: 4,
            savedCards: [],
            showAvatars: false,
            currentAvatar: '',
            selectedAvatar: '',
            avatars: [
                'bear',
                'bunny',
                'fox',
                'owl',
                'squirrel'
            ],
            askDeleteAccount: false,
            deleting: false,
            showForm: false,
            showQR: false,
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            email: "",
            phone: "",
            gender: "",
            marketingEmails: false,
            genders: [
                { name: "Male", value: "MALE" },
                { name: "Female", value: "FEMALE" },
            ],
            nudgesList: [],
            pageNum: 0,
            pageSize: 12,
            totalFeeds: 0,
            tags: [],
            activeTag: null,
            showNudges: false,
            fetchingTags: true,
            isUpdating: false,
            showNudgeDetails: false,
            clickedNudge: null,
            nudgeAchievements: [],
            isDestroyed: false,
            qrImageSrc: "",
            surprise: null
		};
	},
	watch: {},
	computed: {
        fetchingTagsLoadingContent(){
            if(!this.fetchingTags) return [];
            return Array.from({length:8}).map((_, index) => ({index: index}));
        },
        surpriseDescription(){
			if (!this.surprise) return "";
			if (!this.surprise.detail) return "";
			if (!this.surprise.detail.type) return "";
			return this.surprise.detail.type.split(/\r\n|\r|\t/g).join("<br/>").split(/\n/g).join("br/>");
		},
        nudgeSettings(){
            let hq = this.$store.getters.getHeadquarter;
            const achievements = hq?.app?.properties?.nudgeAchievements || "";
            const categories = hq?.app?.properties?.nudgeCategories || "";
            return { 
                achievements: achievements ? achievements.split(',').map((it) => it.trim()) : [], 
                categories: categories ? categories.split(',').map((it) => it.trim()) : []
            }
        },
        tagsDisplay(){
            if(!this.nudgeSettings?.categories?.length) return [];
            const items = this.nudgeSettings?.categories?.map((t) => t.toLowerCase());
            return this.tags?.filter((tag) => items.includes((tag.name.toLowerCase())))?.map((tag) => {
                return {
                    ...tag,
                    nudges: tag.nudges.length ? tag.nudges.sort((a,b) => a.name.localeCompare(b.name)) : []
                }
            });
        },
        isSurprise(){
            if(!this.clickedNudge) return false;
            return this.clickedNudge.type == "SURPRISE";
        },
        allNudgesList(){
            if(isEmpty(this.tags)) return [];
            let items = [];
            for(let i in this.tags){
                items = [...items, ...this.tags[i].nudges];
            }
            return items;
        },
        nudgesInfo(){
            let info = {
                read: 0,
                claimed: 0,
                awarded: 0,
                surprise: [],
                article: [],
                questionnaire: [],
                achievements: []
            }
            if(!this.tags?.length) return info;
            for(let i in this.tags){
                for(let n in this.tags[i].nudges){
                    if(this.nudgeSettings.achievements.includes(this.tags[i].nudges[n].id)){
                        const one = this.nudgeAchievements.find((it) => it.id == this.tags[i].nudges[n].id);
                        if(["READ","CLAIMED"].includes(one.status)) {
                            info.achievements.push(one);
                        }
                    }
                    switch(this.tags[i].nudges[n].status){
                        case "READ":
                            info.read++;
                            break;
                        case "CLAIMED":
                            info.claimed++;
                            break;
                        case "AWARDED":
                            info.awarded++;
                            break;
                    }
                    switch(this.tags[i].nudges[n].type){
                        case "ARTICLE":
                            info.article.push(this.tags[i].nudges[n]);
                            break;
                        case "SURPRISE":
                            info.surprise.push(this.tags[i].nudges[n]);
                            break;
                        case "QUESTIONNAIRE":
                            info.questionnaire.push(this.tags[i].nudges[n]);
                            break;
                    }
                }
            }
            return info;
        },
        qrText() {
			return `#${this.customer?.id}`;
		},
        customerFullname() {
            if(isEmpty(this.customer)) return;
            let names = [];
            if(this.customer.firstName) names.push(this.customer.firstName);
            if(this.customer.lastName) names.push(this.customer.lastName);
            return names.join(' ');
        },
        customerInterests() {
            if(isEmpty(this.customer)) return [];
            if(isEmpty(this.customer.interests)) return [];
            return this.customer.interests.split(',');
        },
        membershipDateInfo() {
            if (isEmpty(this.customer?.registeredDate)) return moment().format("MMM DD, YYYY");
            let date = moment(this.customer.registeredDate).format("MMM DD, YYYY");
            return date;
            // return `Membership active since ${date}`;
        }
    },
	methods: {
        refreshSupriseStatus(){
            let self = this;
            const timer = setInterval(async () => {
                if(!self.isSurprise || self.isDestroyed || !self.showNudgeDetails) {
                    return clearInterval(timer);
                }
                self.surprise = await surpriseService.getDetail(self.clickedNudge.id);
                if ((self.surprise && self.surprise.status == "CLAIMED")) {
                    clearInterval(timer);
                    self.fetchTags();
                }
            }, 3000);
        },
        clickNudge(nudge){
            let self = this;
            const token = this.$store.getters.getToken;
            this.clickedNudge = nudge;
            this.toggleShowNudgeDetails(true);
            this.$nextTick(async () => {
                window.scrollTo({top: 0, behavior: 'smooth'});
                if(self.isSurprise) {
                    self.surprise = await surpriseService.getDetail(self.clickedNudge.id);
                    self.qrImageSrc = `https://api.qrserver.com/v1/create-qr-code/?size=2=500x500&data=${nudge.id}${token}`
                    self.refreshSupriseStatus();
                } else {
                    self.surprise = null;
                    self.qrImageSrc = "";
                }
            })
        },
        nudgeAvatar(nudge){
            if(!nudge?.image) return require('@/assets/images/rox-logo-2025.jpeg');
            return nudge.image;
        },
        tagAvatar(tag){
            if(!tag) return require('@/assets/images/rox-logo-2025.jpeg');
            let nudges = homeService.getValidNudges(tag.nudges);
            let nudge = nudges.find((it) => it.image != '');
            if(!nudge) return require('@/assets/images/rox-logo-2025.jpeg');
            return nudge.image;
        },
        async saveAvatar(){
            if(this.isUpdating) return;
            try {
                if(!this.selectedAvatar) return;
                this.isUpdating = true;
                let json = await homeService.updateAvatar(this.selectedAvatar);
                if(!json?.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
                this.currentAvatar = this.selectedAvatar;
                this.customer = json.customer;
                this.$store.dispatch("setCustomer", json.customer);
                this.showNotification("success", "done", "Your profile is successfully updated.");
            } catch(err){
                this.showNotification("alert", "error_outline", "Something went wrong! " + err.message);
            } finally {
                this.isUpdating = false;
                this.toggleAvatars(false);
            }
        },
        toggleShowNudgeDetails(val){
            if(this.askDeleteAccount) return;
            this.showNudgeDetails = val == true;
            if(val == true){
                this.toggleForm(false);
                this.toggleAvatars(false);
                this.toggleQR(false);
                this.toggleNudges(false);
            }
        },
        toggleDeleteAccount(val){
            this.askDeleteAccount = val == true;
        },
        toggleNudges(val){
            if(this.askDeleteAccount) return;
            this.showNudges = val == true;
            if(val == true){
                this.toggleForm(false);
                this.toggleAvatars(false);
                this.toggleQR(false);
                this.toggleShowNudgeDetails(false);
            }
        },
        toggleQR(val){
            if(this.askDeleteAccount) return;
            this.showQR = val == true;
            if(val == true){
                this.toggleForm(false);
                this.toggleAvatars(false);
                this.toggleNudges(false);
                this.toggleShowNudgeDetails(false);
            }
        },
        toggleForm(val){
            if(this.askDeleteAccount) return;
            this.showForm = val == true;
            if(val == true){
                this.toggleAvatars(false);
                this.toggleQR(false);
                this.toggleNudges(false);
                this.toggleShowNudgeDetails(false);
                this.initForm();
                document.querySelector("input[name='marketingEmails']").checked = this.marketingEmails == true;
            }
        },
        toggleAvatars(val){
            if(this.askDeleteAccount) return;
            this.showAvatars = val == true;
            this.selectedAvatar = this.currentAvatar;
            if(val == true){
                this.toggleForm(false);
                this.toggleQR(false);
                this.toggleNudges(false);
                this.toggleShowNudgeDetails(false);
            }
        },
        initForm(){
            this.firstName = this.customer?.firstName;
            this.lastName = this.customer?.lastName;
            this.gender = this.customer?.gender;
            this.email = this.customer?.email;
            this.phone = this.customer?.phone;
            this.dateOfBirth = this.customer?.dateOfBirth;
            this.marketingEmails = this.customer?.marketingEmails == true;
            this.currentAvatar = this.customer?.avatar || '';
            this.selectedAvatar = this.currentAvatar;
            console.log(this.customer);
        },
        async save() {
            if(this.isUpdating) return;
            try {
                let errors = [];
                if(isEmpty(this.firstName)) errors.push("First name is required.");
                if(isEmpty(this.email)) errors.push("Email address is required.");
                // if(!this.isValidEmail(this.email)) errors.push("Email address is not valid.");
                if(!isEmpty(errors)) return this.showNotification("alert", "error_outline", errors[0]);
                let params = {};
                if(this.firstName != this.customer.firstName) params.firstName = this.firstName;
                if(this.lastName != this.customer.lastName) params.lastName = this.lastName;
                if(this.dateOfBirth != this.customer.dateOfBirth) params.dateOfBirth = `${this.dateOfBirth} 00:00:00`;
                if(this.gender != this.customer.gender) params.gender = this.gender;
                if(this.phone != this.customer.phone) {
                    if(!this.isValidPhoneNumber(this.phone)) return this.showNotification("alert", "error_outline", "Please enter a correct phone number");
                    if(!this.isValidPhone(this.phone)) return this.showNotification("alert", "error_outline", "Please input a valid mobile number");
                    params.phone = this.phone;
                }
                if(this.marketingEmails != this.customer.marketingEmails) params.marketingEmails = this.marketingEmails;
                if (isEmpty(params)) return;
                this.isUpdating = true;
                let json = await homeService.updateCustomerDetails(params);
                if(!json?.success) return this.showNotification("alert", "error_outline", "Something went wrong! " + json.message);
                this.customer = json.customer;
                this.$store.dispatch("setCustomer", json.customer);
                this.showNotification("success", "done", "Your profile is successfully updated.");
            } catch(err){
                this.showNotification("alert", "error_outline", "Something went wrong! " + err.message);
            } finally {
                this.isUpdating = false;
                this.toggleForm(false);
            }
        },
        isValidPhoneNumber(num){
            let regex = /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
			return regex.test(num);
        },
		async setCustomerDetail() {
            try {
                this.customer = this.$store.getters.getCustomer;
                if(this.customer?.avatar) this.currentAvatar = this.customer.avatar;
                let paymentAccounts = this.$store.getters.getPaymentAccounts;
                const res = await getEunoiaCustomerDetails();
                let tokenizedCards = res?.customer?.creditCardTokens || [];
                if(!isEmpty(tokenizedCards)) {
                    tokenizedCards = tokenizedCards.filter((card) => {
                        return paymentAccounts.map((pm) => pm.key).includes(card.accountKey)
                    });
                }
                this.savedCards = tokenizedCards;
                this.loading = false;
            } catch(err){
                console.log(err);
                this.loading = false;
            }
		},
        async deleteMyAccount() {
            try {
                if (this.deleting == true) return;
                this.deleting = true;
                let res = await homeService.deleteCustomerAccount();

                this.toggleDeleteAccount();
                this.deleting = false;
                if (!res.success) {
                    let message = "Something went wrong! " + res.message;
                    return this.showNotification("alert", "error_outline", message);
                }
                this.$store.dispatch("clearLoginToken");
                this.$store.dispatch("clearCustomer");
                this.$router.replace({ name: "LoginPage" });
            } catch (error) {
                this.deleting = false;
                this.showNotification("alert", "error_outline", error);
            }
        },
        async fetchTags(){
            try {
                if(this.nudgeSettings.achievements?.length > 0){
                    const achs = [...this.nudgeSettings.achievements];
                    const items = await Promise.all(
                        achs.map(id => nudgeConnector.getNudges({id}))
                    );
                    this.nudgeAchievements = items?.filter((it) => it.nudges?.length > 0)?.map((it) => new Nudge(it.nudges[0]));
                }
                this.fetchingTags = true;
                let cats = this.nudgeSettings?.categories || [];
                const res = await homeService.getNudgeTags({
                    tags: cats
                });
                this.tags = res?.tags?.length > 0 ? [...new Set(res?.tags)] : [];
            } catch(e) {
                console.log(e);
            } finally {
                this.fetchingTags = false;
            }
        },
        clickTag(tag){
            this.activeTag = tag;
            this.toggleNudges(true);
            this.$nextTick(() => {
                window.scrollTo({top: 0, behavior: 'smooth'});
            })
        },
        modalTriggerHandler(e){
            if(this.isUpdating) return;
            if(e.target.closest('.modal-trigger') || e.target.closest('.avatars-modal')) return;
            this.toggleForm(false);
            this.toggleAvatars(false);
            this.toggleQR(false);
            this.toggleNudges(false);
            this.toggleShowNudgeDetails(false);
        }
	},
	async created() {
		try {
            this.loading = true;
            if (!this.$store.getters.hasInited) {
                await this.refreshMainData()
            } else {
                await this.refreshCustomerData();
            }
			await this.setCustomerDetail();
            this.fetchTags();
		} catch (error) {
			this.loading = false;
			this.showNotification("alert", "error_outline", error);
		}
	},
    mounted(){
        this.isDestroyed = false;
        document.body.addEventListener('click', this.modalTriggerHandler);
    },
    beforeUnmount(){
        this.isDestroyed = true;
        document.body.removeEventListener('click', this.modalTriggerHandler);
    }
};
</script>

<style scoped lang="scss">
.surprise-content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    .surprise-name {
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        font-size: 16px;
        margin-top: 10px;
    }
    .surprise-image {
        min-width: 150px;
        max-width: 150px;
        min-height: 150px;
        max-height: 150px;
        border-radius: 50%;
        overflow: hidden;
    }
    .surprise-qr {
        width: 100%;
        max-width: 200px;
    }
    .surprise-btn {
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        padding: 8px 24px;
        background: $main-red;
        border-radius: 999px;
        color: $white;
        text-decoration: none;
        cursor: pointer;
        margin-block: 20px;
    }
}
@keyframes fetchingAnim {
    0% {
        background: linear-gradient(90deg, $secondary-color-30 0%, $secondary-color-20);
    }
    100% {
        background: linear-gradient(90deg, $secondary-color-30 100%, $secondary-color-20);
    }
}
@-webkit-keyframes fetchingAnim {
    0% {
        background: linear-gradient(90deg, $secondary-color-30 0%, $secondary-color-20);
    }
    100% {
        background: linear-gradient(90deg, $secondary-color-30 100%, $secondary-color-20);
    }
}
.tag-groups {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    gap: 20px;
    .group-name {
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        font-size: 16px;
        width: 100%;
        text-align: left;
        &:is(.uppercase){
            text-transform: uppercase;
        }
    }
}
.page-title {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 24px;
    line-height: 38px;
    letter-spacing: 0px;
    display: flex;
    justify-content: space-between;
    position: relative;
    margin-bottom: 10px;
    gap: 32px;
    width: 100%;
    text-align: left;
    color: $main-red;
    font-weight: normal !important;
    .material-icons,
    .material-icons-outlined {
        right: 16px;
    }
}
.page-subtitle {
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    font-size: 16px;
    width: 100%;
    text-align: left;
    &:is(.uppercase){
        text-transform: uppercase;
    }
}
.tags-empty {
    width: 100%;
    aspect-ratio: 5/0.6;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    padding: 20px;
    gap: 20px;
    font-size: 20px;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    color: $secondary-color-50;
    i {
        font-size: 2.5em !important;
    }
}
.tags-list {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90%, 1fr)) !important;
    gap: 20px;
    padding-bottom: 20px;
    .tag-item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        &:hover {
            .tag-icon {
                border-color: $main-red;
            }
            & > * {
                color: $main-red;
            }
        }
        &:is(.no-action){
            pointer-events: none;
        }
        &:is(.disabled){
            filter: grayscale(1);
            pointer-events: none;
        }
        .tag-icon {
            cursor: pointer;
            min-width: 120px;
            max-width: 120px;
            border-radius: 50%;
            overflow: hidden;
            background: $secondary-color-20;
            aspect-ratio: 1/1;
            border: 2px solid transparent;
            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
        }
        .tag-title {
            cursor: pointer;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            display: flex;
            flex-direction: column;
            font-size: 16px;
            text-align: left;
            text-transform: uppercase;
        }
        .clamps {
            line-clamp: 3;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            overflow-wrap: break-word;
        }
        .tag-subtitle {
            font-family: 'Berthold Akzidenz Grotesk Regular', sans-serif;
            margin-top: 4px;
            font-size: small !important;
            line-height: 16px;
            color: $secondary-color-50;
            text-transform: none !important;
        }
    }
    &:is(.column){
        .tag-item {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
    }
    &:is(.shimmer){
        .tag-item {
            pointer-events: none;
        }
        .tag-icon {
            border: 0 !important;
            transition: all 1s;
            -webkit-transition: all 1s;
            animation: fetchingAnim 1s ease-in-out infinite;
            -webkit-animation: fetchingAnim 1s ease-in-out infinite;
        }
        .shimmer-title {
            display: block;
            min-width: 150px;
            min-height: 24px;
            border-radius: 999px;
            transition: all 1s;
            -webkit-transition: all 1s;
            animation: fetchingAnim 1s ease-in-out infinite;
            -webkit-animation: fetchingAnim 1s ease-in-out infinite;
        }
        .tag-subtitle {
            margin-top: 10px;
            min-height: 12px;
            border-radius: 999px;
            transition: all 1s;
            -webkit-transition: all 1s;
            animation: fetchingAnim 1s ease-in-out infinite;
            -webkit-animation: fetchingAnim 1s ease-in-out infinite;
        }
    }
}
.nudges-grid {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90%, 1fr)) !important;
    gap: 20px;
    padding-block: 20px;
}
.modal-close-btn {
    cursor: pointer;
}
.inputs {
    margin-top: 30px;
    align-items: flex-start;
    justify-content: flex-start;
}
.form-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
}
.profile-container {
    width: 100%;
    display: flex;
    gap: 24px;
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;
    min-height: 100vh;
}
.profile-label {
    text-align: left;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 30px;
    padding-inline: 20px;
    font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
    .home-link {
        color: $secondary-color-50;
    }
    i {
        color: $secondary-color-50 !important;
    }
}
.profile-account-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    background: $custom-bg;
    .profile-avatar {
        min-width: 120px;
        min-height: 120px;
        max-width: 120px;
        max-height: 120px;
        border-radius: 50%;
        background: $secondary-color-20;
        margin-bottom: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid transparent;
        overflow: hidden;
        cursor: pointer;
        &:hover {
            border-color: $main-red;
        }
        .material-icons-outlined {
            font-size: 3.5em;
            color: $secondary-color-60;
        }
        img {
            width: inherit;
            object-fit: cover;
        }
    }
    .profile-account {
        padding: 20px;
        text-align: left;
        display: flex;
        gap: 20px;
        .profile-account-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: flex-start;
            gap: 10px;
            width: 100%;
        }
        .profile-name {
            text-transform: capitalize;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            color: $main-red;
            font-size: 1.5em;
            i {
                color: $secondary-color-50;
                cursor: pointer;
                &:hover {
                    color: $secondary-color-70;
                }
            }
        }
        .profile-email {
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            color: $secondary-color-50;
        }
    }
    .account-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
        margin-top: 10px;
        width: 100%;
        text-decoration: none;
        .account-widget {
            color: $main-red;
            font-size: 2em !important;
            cursor: pointer;
            text-decoration: none;
            &:hover {
                opacity: 0.7;
            }
            &:is(.block){
                background: $main-red;
                color: $white;
                padding: 6px;
                display: flex;
                aspect-ratio: 1/1;
                align-items: center;
                justify-content: center;
                font-size: 1.5em !important;
                border-radius: 50%;
            }
        }
        .account-registered {
            padding: 6px 20px;
            border-radius: 999px;
            border: 1px solid transparent;
            background: $main-red;
            color: $white;
            font-size: 12px;
            font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
            display: flex;
            align-items: center;
            text-decoration: none;
            gap: 4px;
            i {
                font-size: 16px !important;
            }
            &:is(.pull-right){
                margin-left: auto;
            }
            &:is(.outlined){
                border-color: $main-red;
                color: $main-red;
                background: transparent;
                cursor: pointer;
            }
            &:is(.plain){
                cursor: pointer;
                padding-inline: 0 !important;
                border-color: transparent;
                color: $main-red;
                background: transparent;
            }
        }
    }
}
.profile-features {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    padding-inline: 20px;
    padding-block: 30px;
    gap: 20px;
    .profile-item {
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        width: 100%;
        cursor: pointer;
        padding-block: 16px;
        border-top: 1px solid $secondary-color-20;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        text-decoration: none;
        color: $secondary-color-90;
        .profile-info {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            line-height: 20px;
            .profile-info-subtitle {
                color: $secondary-color-50;
                font-size: small;
            }
        }
        &.logout {
            color: $primary-color-60;
            font-weight: bold;
        }
        &:hover {
            opacity: 0.7;
        }
        .profile-item-nav {
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
}
.avatars-modal {
    position: absolute;
    z-index: 999;
    right: 0;
    top: 0;
    height: fit-content;
    max-height: 100%;
    width: 100%;
    max-width: 350px;
    overflow-y: auto;
    background: $white;
    padding: 20px;
    transform: translateX(100%);
    -webkit-transform: translateX(100%);
    transition: all 0.25s ease-in-out;
    -webkit-transition: all 0.25s ease-in-out;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    &:is(.active){
        transform: translateX(0);
        -webkit-transform: translateX(0);
    }
    .close-modal {
        min-width: 25px;
        min-height: 25px;
        max-width: 25px;
        max-height: 25px;
        border-radius: 50%;
        background: $secondary-color-20;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        margin-left: auto;
        &:hover {
            opacity: 0.7;
        }
    }
    .avatar-modal-text {
        color: $secondary-color-50;
        margin-block: 10px;
        text-align: center;
        width: 100%;
    }
    .avatar-modal-title {
        margin-top: 20px;
        text-align: center;
        font-size: 20px;
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        color: $main-red;
        width: 100%;
    }
    .save-avatar-btn {
        width: fit-content;
        margin-inline: auto;
        padding: 8px 48px;
        border-radius: 999px;
        background: $main-red;
        color: $white;
        cursor: pointer;
        border: none;
        outline: none;
        font-family: 'Berthold Akzidenz Grotesk Medium', sans-serif;
        margin-top: 32px;
        &:is(.outlined){
            border: 1px solid $main-red;
            background: $white;
            color: $main-red;
        }
        &:hover {
            opacity: 0.7;
        }
        & + .save-avatar-btn {
            margin-top: 16px;
        }
    }
    .qr-code {
        width: 100%;
        max-width: 350px;
        margin-inline: auto;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .logo-footer {
        max-width: 90px;
        object-fit: contain;
        margin-inline: auto;
        margin-top: 40px;
    }
}
.selected-avatar {
    min-width: 120px;
    max-width: 120px;
    aspect-ratio: 1/1;
    margin-inline: auto;
    margin-block: 20px;
    background: $secondary-color-20;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
        object-fit: contain;
        width: 100%;
    }
    i {
        font-size: 4em !important;
        color: $secondary-color-50;
    }
}
.avatars {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 20px;
    img {
        width: 80px;
        height: 80px;
        object-fit: contain;
        cursor: pointer;
        border: 2px solid transparent;
        border-radius: 50%;
        &:is(.selected){
            border-color: $main-red;
        }
        &:hover {
            opacity: 0.7;
        }
    }
}
@media (min-width: 672px) {
    .profile-account-wrapper {
        .profile-account {
            gap: 32px;
            .profile-name {
                font-size: 2em !important;
            }
        }
        .account-actions {
            .account-widget {
                font-size: 2.5em !important;
            }
            .account-registered {
                padding: 8px 24px;
                font-size: 15px !important;
            }
        }
    }
    .profile-features {
        .profile-item {
            border: 1px solid $secondary-color-20;
            background: $white;
            border-radius: 12px;
            border: 1px solid $secondary-color-20;
            padding: 16px;
        }
    }
    .avatars-modal {
        max-width: 500px !important;
    }
    .avatars {
        max-width: 350px;
        margin-inline: auto;
    }
    .nudges-grid  {
        grid-template-columns: repeat(auto-fill, minmax(40%, 1fr)) !important;
    }
    .tags-list {
        grid-template-columns: repeat(auto-fill, minmax(20%, 1fr)) !important;
    }
    .tags-fetching {
        grid-template-columns: repeat(auto-fill, minmax(40%, 1fr)) !important;
    }
}
@media(min-width: 672px) and (max-width: 768px){
    .tags-list {
        grid-template-columns: repeat(auto-fill, minmax(40%, 1fr)) !important;
    }
}
</style>
