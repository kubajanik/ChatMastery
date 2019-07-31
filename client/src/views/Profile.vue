<template>
    <div class="overlay" v-if="show">

        <div class="profile">
            <close-icon 
                class="profile__close" 
                @click="close" 
                fillColor="#c3c4c4" 
                :size="30" 
            />
            
            <edit-photo :photo="$root.user.avatar" @change="changePhoto" />
            
            <button class="profile__button" @click="update">Save</button>

            <div class="profile__updating" v-if="isUpdating">
                <loading color="#009ef7" size="47px" />
                <span>Please waiting...</span>
            </div>
        </div>
    </div>
</template>

<script>
import CloseIcon from 'vue-material-design-icons/Close';
import EditPhoto from '@/components/EditPhoto';
import UploadService from '@/services/UploadService';
import UsersService from '@/services/UsersService';
import Loading from 'vue-spinner/src/ClipLoader';

export default {
    name: 'Profile',
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    components: {
        CloseIcon,
        EditPhoto,
        Loading
    },
    data() {
        return {
            isVisible: this.show,
            user: { ...this.$root.user },
            isUpdating: false
        };
    },
    methods: {
        close() {
            this.isVisible = false;
            this.$emit('close');
        },
        changePhoto(image) {
            this.user.avatar = image;
        },
        async uploadImage() {
            if (this.user.avatar instanceof Object) {
                const response = await UploadService.uploadImage(this.user.avatar, 'users');
                this.user.avatar = response.data.url;
            }
        },
        async update() {
            this.isUpdating = true;

            await this.uploadImage();

            const response = await UsersService.update(this.user._id, this.user);
            this.$root.user = response.data;

            this.isUpdating = false;
        }
    }
}
</script>

<style lang="scss" scoped>
    @media (min-width: 900px) {
        .overlay {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: #0000003d;
            position: fixed;
            top: 0;
            left: 0;
            z-index: 1;
        }
    }

    .profile {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 700px;
        height: 700px;
        max-width: 800px;
        max-height: 80%;
        background: #fff;
        position: relative;
        margin: 0 auto;
        z-index: 1;
        padding: 32px;
        border-radius: 2px;

        &__close {
            position: absolute;
            top: 16px;
            right: 16px;

            &:hover {
                cursor: pointer;
            }
        }

        &__button {
            font: {
                size: 16px;
                family: inherit;
            }
            border: 0;
            color: #fff;
            border-radius: 2px;
            background: #009ef7;
            padding: 10px 32px;
            font-weight: 600;
            margin-top: 32px;

             &:focus {
                outline: 0;
            }

            &:hover {
                transition: .3s ease-in-out;
                cursor: pointer;
                background: darken(#3399FF, 5%);
            }
        }

        &__updating {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #ffffffe0;
            position: absolute;
            top: 0;
            width: 100%;
            height: 100%;

            & > span {
                font: {
                    size: 16px;
                    weight: 600
                }
                margin-top: 6px;
            }
        }

        @media (max-width: 900px) {
            position: fixed;
            top: 0;
            left: 0;
            max-height: none;
            max-width: none;
            width: 100%;
            height: 100%;
            padding: 0;
        }
    }
</style>