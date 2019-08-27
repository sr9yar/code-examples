<template>

  <div class="custom-accordion-wrapper">
    <div class="custom-accordion-inner">
      <div
        :class="{ open: value.open, 'can-open': openOnHeaderClick }"
        class="custom-accordion-header"
        @click="openOnHeaderClick ? value.open=!value.open : null">
        <div class="custom-accordion-title-wrapper">
          <div class="custom-accordion-title">
            {{ value.name }}
          </div>
          <div class="custom-accordion-badges">
            <div class="custom-accordion-badge">
              {{value.items.length}}
            </div>
          </div>
        </div>
        <div
          class="custom-accordion-chevron"
          @click="value.open=!value.open">

          <fa-icon v-if="!useCustomIcons" :icon="['far', 'chevron-up']"
                   :class="{ rotated: !value.open }"/>
          <custom-icon v-if="useCustomIcons" :icon="'chevron-up'"
                       :custom-class="customClassValue()"/>

        </div>
      </div>


      <div :class="{ collapsed: !value.open }" class="custom-accordion-panel">
        <div v-if="value.tableHeaders" class="custom-accordion-line titles-line">

          <div class="table-header-title-cell table-cell title-cell">
            {{ value.title ? value.title : 'Title' }}
          </div>

          <div class="table-header-body">

            <div
              v-for="(header, index) in value.tableHeaders"
              :key="index"
              class="table-cell title-cell">
              {{header.title}}
            </div>
          </div>
          <div class="table-header-icons-cell"/>
        </div>
        <div
          v-for="item in value.items"
          :key="item.id"
          class="custom-accordion-line data-line">
          <div class="custom-accordion-line-title">
            <div class="custom-accordion-line-title-main">
              {{ item.name }}
            </div>
            <div class="custom-accordion-line-title-sub">
              {{ item.subtitle }}
              <span
                class="custom-accordion-line-title-sub-append">
                {{ item.subtitleAppend }}
              </span>
            </div>
          </div>


          <div v-if="value.tableHeaders" class="table-body">

            <div
              v-for="(header, index) in value.tableHeaders"
              :key="index"
              :class="{[header.cellClass]: header.cellClass , 'data-cell': !header.cellClass }"
              class="table-cell data-cell">
              {{item[header.prop]}}
            </div>
          </div>


          <div class="custom-accordion-line-icons">
            <div
              v-if="hasListener('calendar-click')"
              class="custom-accordion-line-icon"
              @click="onCalendarClick(item)">
              <fa-icon v-if="!useCustomIcons" :icon="['far', 'calendar-alt']" />
              <custom-icon v-if="useCustomIcons" icon="calendar" />
            </div>
            <div
              v-if="hasListener('edit-click')"
              class="custom-accordion-line-icon"
              @click="onEditClick(item)">
              <fa-icon v-if="!useCustomIcons" :icon="['fas', 'pencil']" />
              <custom-icon v-if="useCustomIcons" icon="edit" />
            </div>
            <div
              v-if="hasListener('copy-click')"
              class="custom-accordion-line-icon"
              @click="onCopyClick(item)">
              <fa-icon v-if="!useCustomIcons" :icon="['far', 'copy']" />
              <custom-icon v-if="useCustomIcons" :icon="'copy'" />
            </div>
            <div
              v-if="hasListener('eye-click')"
              class="custom-accordion-line-icon"
              @click="onEyeClick(item)">
              <fa-icon v-if="!useCustomIcons" :icon="['fas', 'eye']" />
              <custom-icon v-if="useCustomIcons" :icon="'eye'" />
            </div>
            <div
              v-if="hasListener('delete-click')"
              class="custom-accordion-line-icon"
              @click="onDeleteClick(item)">
              <fa-icon v-if="!useCustomIcons" :icon="['fas', 'trash']" />
              <custom-icon v-if="useCustomIcons" :icon="'trash'" />
            </div>
            <div
              v-if="hasListener('settings-click')"
              class="custom-accordion-line-icon"
              @click="onSettingsClick(item)">
              <fa-icon v-if="!useCustomIcons" :icon="['fas', 'cog']" />
              <custom-icon v-if="useCustomIcons" :icon="'cog'" />
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>


<script>


  import CustomIcon from '@/components/shared/CustomIcon';

  export default {
    components: {
      CustomIcon,
    },
    props: {
      value: {
        default: () => ({
          name: '',
          open: false,
          items: [],
        }),
        type: [Object],
      },
      useCustomIcons: {
        default: true,
        type: Boolean,
      },
      openOnHeaderClick: {
        default: false,
        type: Boolean,
      },
    },
    data: () => ({


    }),
    updated() {
      this.$nextTick(() => {
        this.setPanelHeight();
        this.updateTableWidths();
      });
    },

    mounted() {
      this.$nextTick(() => {
        this.setPanelHeight();
        window.addEventListener('resize', this.setPanelHeight);
        window.addEventListener('resize', this.updateTableWidths);
        setTimeout(() => {
          this.setPanelHeight();
          this.updateTableWidths();
        }, 500);
      });
    },
    beforeDestroy() {
      window.removeEventListener('resize', this.setPanelHeight);
      window.removeEventListener('resize', this.updateTableWidths);
    },

    methods: {
      customClassValue() {
        return this.value.open ? '' : 'rotated';
      },
      onSettingsClick(item) {
        this.$emit('settings-click', item);
      },

      onEditClick(item) {
        this.$emit('edit-click', item);
      },

      onDeleteClick(item) {
        this.$emit('delete-click', item);
      },

      onCopyClick(item) {
        this.$emit('copy-click', item);
      },

      onCalendarClick(item) {
        this.$emit('calendar-click', item);
      },

      onEyeClick(item) {
        this.$emit('eye-click', item);
      },


      hasListener(listenerName) {
        return this.$listeners && this.$listeners[listenerName];
      },

      setPanelHeight() {
        const [panel] = this.$el.querySelectorAll('.custom-accordion-panel');
        const lines = this.$el.querySelectorAll('.custom-accordion-line');

        let linesHeight = 0;
        lines.forEach((line) => {
          linesHeight += line.scrollHeight;
        });
        linesHeight += (1 + lines.length);

        if (panel) {
          panel.style.transition = 'all 0s ease 0s';
          panel.style.height = `${linesHeight}px`;
          setTimeout(() => {
            panel.style.removeProperty('transition');
          }, 0);
          // panel.style.height = panel.scrollHeight + 'px';
        }
        return null;
      },
      updateTableWidths() {
        const minTitleCellWidth = 250;
        const lines = this.$el.querySelectorAll('.data-line');

        if (!lines.length) {
          return null;
        }
        const [body] = this.$el.querySelectorAll('.data-line .table-body');

        if (!body) {
          return null;
        }

        // const bodyStyles = window.getComputedStyle(body);

        const [line] = lines;
        const lineStyles = window.getComputedStyle(line);
        const [title] = this.$el.querySelectorAll('.data-line .custom-accordion-line-title');
        // const titleStyles = window.getComputedStyle(title);
        const [icons] = this.$el.querySelectorAll('.data-line .custom-accordion-line-icons');
        // const iconsStyles = window.getComputedStyle(icons);
        const cells = line.querySelectorAll('.data-line .table-body .table-cell');


        const innerWidth = line.clientWidth - (
          parseFloat(lineStyles.paddingLeft) + parseFloat(lineStyles.paddingRight)
        );

        title.style.width = 'auto';

        const sWidth = Math.floor(title.clientWidth + title.clientWidth * 0.2);
        const titleWidth = (sWidth < minTitleCellWidth) ? minTitleCellWidth : sWidth;

        // title.style.width = `${ titleWidth }px`;

        const bodyWidth = Math.floor(innerWidth - titleWidth - icons.clientWidth);
        // body.style.width = `${Math.floor( bodyWidth ) }px`;

        const iconsWidth = Math.floor(icons.clientWidth);

        const cellLength = Math.floor(bodyWidth / cells.length);


        lines.forEach((l) => {
          const [lineTitle] = l.querySelectorAll('.custom-accordion-line-title');
          const [lineBody] = l.querySelectorAll('.table-body');
          const [lineIcons] = l.querySelectorAll('.custom-accordion-line-icons');
          const lineCells = l.querySelectorAll('.table-body .table-cell');

          lineTitle.style.width = `${titleWidth}px`;
          lineBody.style.width = `${bodyWidth}px`;
          lineIcons.style.width = `${iconsWidth}px`;
          lineCells.forEach((lineCell, index) => {
            lineCells[index].style.width = `${Math.floor(cellLength)}px`;
          });
        });


        const [titlesLine] = this.$el.querySelectorAll('.titles-line');
        const [titlesLineTitle] = titlesLine.querySelectorAll('.table-header-title-cell');
        const [titlesLineBody] = titlesLine.querySelectorAll('.table-header-body');
        const [titlesLineIcons] = titlesLine.querySelectorAll('.table-header-icons-cell');
        const titlesLineCells = titlesLine.querySelectorAll('.table-header-body .table-cell');

        titlesLineTitle.style.width = `${titleWidth}px`;
        titlesLineBody.style.width = `${bodyWidth}px`;
        titlesLineIcons.style.width = `${iconsWidth}px`;
        titlesLineCells.forEach((cell, index) => {
          titlesLineCells[index].style.width = `${Math.floor(cellLength)}px`;
        });

        return null;
      },

    },


  };
</script>
