<template>
  <div id="oauth-container" class="flex flex-col gap-3">
    <Button
      variant="outline"
      class="w-full cursor-pointer"
      :disabled="!codeClient"
      @click="handleGoogleLogin"
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        class="size-4"
        alt=""
        aria-hidden="true"
      />
      Continue with Google
    </Button>
    <Button variant="outline" class="w-full" disabled> Continue with Facebook </Button>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { onMounted, ref } from 'vue';
import { useGoogleAuth } from '../composables/useGoogleAuth';
import { useMutation } from '@pinia/colada';
import { googleAuthMutation } from '@/api/auth';
import { toast } from 'vue-sonner';

const { createCodeClient } = useGoogleAuth();

const codeClient = ref<google.accounts.oauth2.CodeClient | null>(null);

const { mutate: googleAuth } = useMutation(googleAuthMutation());

onMounted(async () => {
  try {
    codeClient.value = await createCodeClient((response) => {
      googleAuth(response.code);
    });
  } catch {
    // GSI script failed to load — button remains disabled
    toast.error('No social OAuth available. Try again later.');
  }
});

const handleGoogleLogin = () => {
  codeClient.value?.requestCode();
};
</script>
