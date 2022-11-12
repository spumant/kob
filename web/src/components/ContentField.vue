<template>
    <div class="container content-field">
        <div class="card">
            <div class="card-body">
                <slot></slot><!--未来要被填充的地方需要一个slot-->
            </div>
        </div>
    </div>
</template>

<script>
</script>

<style scoped>
div.content-field{
    margin-top: 20px;
    
}
</style>