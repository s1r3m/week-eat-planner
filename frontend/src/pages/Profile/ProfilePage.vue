<template>
  <div class="profile-page-container space-y-6 m-6">
    <PageTitle header="Profile" description="Manage your account details" />
    <ErrorRetryCard v-if="error" :error="error" :retry="refetch" />
    <UserEditForm v-else-if="user" v-model="user" />
    <TheLoadingPageState v-else-if="!user || isLoading" loading-name="user profile" />
  </div>
</template>

<script setup lang="ts">
import { useQuery } from '@pinia/colada';
import { getUserQuery } from '@/api/user';

import PageTitle from '@/components/shared/PageTitle.vue';
import ErrorRetryCard from '@/components/shared/ErrorRetryCard.vue';
import TheLoadingPageState from '@/layouts/components/TheLoadingPageState.vue';
import UserEditForm from '@/features/auth/components/UserEditForm.vue';

const { data: user, isLoading, error, refetch } = useQuery(getUserQuery());
</script>
