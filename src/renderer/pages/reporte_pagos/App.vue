<template>
  <v-app>
    <v-system-bar app color="primary" class="pr-0">
      <v-icon color="white mr-3">mdi-file</v-icon>
      <span>reporte de pagos</span>
      <v-spacer></v-spacer>
      <v-btn size="small" variant="text" @click="minimizar">
        <v-icon color="white">mdi-window-minimize</v-icon>
      </v-btn>
      <v-btn size="small" variant="text" @click="close">
        <v-icon color="white">mdi-window-close</v-icon>
      </v-btn>
    </v-system-bar>
    <v-app-bar app color="secondary">
      <v-toolbar-title>Conceptos de Pagos</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn class="bg-primary" @click="buscar">
        <v-icon>mdi-magnify</v-icon>Buscar Pagos
      </v-btn>
      <v-btn class="mr-3" text @click="imprimir" v-if="lst_pagos.length>0">
        <v-icon class="mr-1">mdi-printer</v-icon>Imprimir
      </v-btn>
      <v-btn class="mr-3" text @click="exportar" v-if="lst_pagos.length>0">
        <v-icon>mdi-file-excel</v-icon>Exportar
      </v-btn>
      <v-btn color @click="generar" text v-if="lst_pagos.length>0">
        <v-icon>mdi-file-pdf</v-icon>Generar
      </v-btn>
      <template v-slot:extension>
        <v-row class="mt-2">
          <v-col>
            <v-text-field
              label="Cajero(a)"
              v-model="cajeroText"
              hide-details
              color="secondary"
              readonly
            ></v-text-field>
          </v-col>
          <v-col>
            <!-- <v-menu
              ref="menu"
              v-model="menu"
              :close-on-content-click="false"
              :return-value.sync="date"
              transition="scale-transition"
              offset-y
              min-width="290px"
            > -->
              <!-- <template v-slot:activator="{ on }"> -->
                <v-text-field
                  v-model="fecha_inicio"
                  label="Dia Inicio"
                  prepend-icon="mdi-calendar"
                  readonly
                  
                  clearable
                  color="secondary"
                >
                <q-popup-proxy   transition-show="scale" transition-hide="scale">
              <v-card>
                  <q-date  color="primary" v-model="fecha_inicio" mask="YYYY-MM-DD"></q-date>
              </v-card>
              </q-popup-proxy>
                </v-text-field>
              <!-- </template> -->
              <!-- <v-date-picker v-model="date" no-title scrollable color="secondary">
                <v-spacer></v-spacer>
                <v-btn text color="secondary" @click="menu = false">Cancel</v-btn>
                <v-btn text color="secondary" @click="$refs.menu.save(date)">OK</v-btn>
              </v-date-picker> -->
            <!-- </v-menu> -->
          </v-col>
          <v-col>
            <!-- <v-menu
              ref="menu2"
              v-model="menu2"
              :close-on-content-click="false"
              :return-value.sync="date2"
              transition="scale-transition"
              offset-y
              min-width="290px"
            > -->
              <!-- <template v-slot:activator="{ on }"> -->
                <v-text-field
                  v-model="fecha_fin"
                  label="Dia Fin"
                  prepend-icon="mdi-calendar"
                  readonly
                  
                  clearable
                  color="secondary"
                >
                <q-popup-proxy coverx transition-show="scale" transition-hide="scale">
              <v-card>
                  <q-date color="secondary" v-model="fecha_fin"  mask="YYYY-MM-DD"></q-date>
              </v-card>
              </q-popup-proxy>
                </v-text-field>
              <!-- </template> -->
              
              <!-- <v-date-picker v-model="date2" :min="date" no-title scrollable color="secondary">
                <v-spacer></v-spacer>
                <v-btn text color="secondary" @click="menu2 = false">Cancel</v-btn>
                <v-btn text color="secondary" @click="$refs.menu2.save(date2)">OK</v-btn>
              </v-date-picker> -->
            <!-- </v-menu> -->
          </v-col>
        </v-row>
      </template>
    </v-app-bar>
    <v-main id="conttt">
      <v-container fluid>
        <div>
          
          <q-table :columns="headersTablaDetalle.map(i=>({label:i.text,name:i.value,field:i.value}))" :rows="lst_pagos">

          <template v-slot:body-cell-fecha_hora_cobro="props">
        <q-td :props="props">
          {{ dayjs(props.row.fecha_hora_cobro).format('DD-MM-YYYY H:mm')  }}
        </q-td>
      </template>

          </q-table>
          <!-- <v-data-table
            id="tablaDetalle"
            :headers="headersTablaDetalle"
            :items="lst_pagos"
            :items-per-page="10"
            :calculate-widths="true"
            class="elevation-2"
            item-key="cve_cargo"
            color="secondary"
          >
            <template v-slot:header>
              <tr>
                <th colspan="4" class="text-center secondary lighten-2xx white--text">Cargos</th>
                <th colspan="8" class="text-center secondary lighten-1 white--text accent-2xx">Pagos</th>
              </tr>
            </template>

            <template v-slot:item.descuento="{ item }">{{item.monto}}</template>
            <template
              v-slot:item.subtotal="{ item }"
            >{{item.total-item.monto}}</template>
            <template v-slot:item.total2="{ item }">{{item.total-item.monto}}</template>
            <template v-slot:item.iva="{ item }">{{item.total-item.monto}}</template>
            <template v-slot:item.total="{ item }">{{item.total}}</template>
            <template
              v-slot:item.fecha_hora_cobro="{ item }"
            >{{item.fecha_hora_cobro}}</template>

            <template v-slot:item.sociox="{item}">{{item.sociox}}</template>

            <template v-slot:item.folio="{ item }">
              <label v-if="item.folio === null">N/A</label>
              <label v-else>{{item.folio}}</label>
            </template>

            <template v-slot:footer>
              <v-row justify="center">
                <v-col>
                  <b>&nbsp;Cargo:</b>
                  {{cCargo}}
                </v-col>
                <v-col>
                  <b>&nbsp;Subtotal:</b>
                  {{cSubtotal}}
                </v-col>
                <v-col>
                  <b>IVA:</b>
                  {{cIva}}
                </v-col>
                <v-col>
                  <b>Total:</b>
                  {{cTotal}}
                </v-col>
                <v-col>
                  <b>Descuentos:</b>
                  {{cDescuento}}
                </v-col>
              </v-row>
            </template>
          </v-data-table> -->
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import {ref,computed,onMounted} from 'vue'
import _ from "lodash";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import numeral from "numeral";
import printJS from 'print-js'
import dayjs from 'dayjs'
import  {QTable,QTd,QDate,QPopupProxy} from 'quasar'
import type {IPagosFilterConcepto} from './../../../main/model/model-type' 
import {useStorage} from 'vue3-storage'


const ls=useStorage()


onMounted(()=>{
  cajeroText.value=ls.getStorageSync('user')
    buscar()
})
  
      const accionMask= {
        mask: "FFFFF",
        tokens: {
          F: {
            pattern: /[0-9a-zA-Z]/,
            transform(v) {
              return v.toLocaleUpperCase();
            }
          }
        }
      }
      const accion= ref("")
      const concepto=ref(0)
      const menu=ref(false)
      const fecha_inicio=ref<string>(dayjs().format("YYYY-MM-DD"))
      const menu2=ref(false)
      const fecha_fin=ref<string>(dayjs().format("YYYY-MM-DD"))
      const menu3=ref(false)
      const date3=ref(null)
      const cajero=ref(0)
      const cajeroText=ref('')
      const lst_cajero=ref([])
      const lst_conceptos=ref([])
      const lst_pagos=ref([])


      const headersTablaDetalle= [
        { text: "Accion", value: "accion" },
        { text: "Cargo", value: "concepto" },
        { text: "Periodo", value: "periodo" },
        { text: "Nombre", value: "sociox" },
        { text: "Folio", value: "folio" },
        { text: "Cargo", value: "total" },
        { text: "Descuento", value: "descuento" },
        { text: "Subtotal", value: "subtotal" },
        { text: "IVA", value: "iva" },
        // { text: "Total", value: "total2" },

        { text: "Fecha", value: "fecha_hora_cobro" },
        // { text: "Cobro", value: "cajerox" }
      ]


      const cCargo=computed(()=> {
      return lst_pagos.value
        .map(item => parseFloat(_.isNull(item.total) ? 0 : item.total))
        .reduce((reductor, value) => reductor + value, 0);
    })
    const cSubtotal=computed(() =>{
      // return this.lst_pagos.map(item=>parseFloat(_.isNull(item.total-item.monto)?0:item.total-item.monto)).reduce((reductor,value)=>reductor+value,0);
      return (cTotal.value / 116) * 100;
    })
    const cIva=computed(()=> {
      // return this.lst_pagos.map(item=>parseFloat(_.isNull(item.total-item.monto)?0:item.total-item.monto)).reduce((reductor,value)=>reductor+value,0);
      return (cTotal.value / 116) * 100 * 0.16;
    })
    const cTotal=computed(()=> {
      return lst_pagos.value
        .map(item =>
          parseFloat(
            _.isNull(item.total - item.monto) ? 0 : item.total - item.monto
          )
        )
        .reduce((reductor, value) => reductor + value, 0);
    })
    const cDescuento=computed(()=> {
      return lst_pagos.value
        .map(item => parseFloat(_.isNull(item.monto) ? 0 : item.monto))
        .reduce((reductor, value) => reductor + value, 0);
    })
   
  

    function buscar() {

      // let fecha_inicio =fecha_inicio.value
      console.log("🚀 ~ file: App.vue ~ line 283 ~ buscar ~ fecha_inicio.value", fecha_inicio.value)
      // let fecha_fin =fecha_fin.value
      console.log("🚀 ~ file: App.vue ~ line 285 ~ buscar ~ fecha_fin.value", fecha_fin.value)

      const dataSend:IPagosFilterConcepto={
        cajero:1,
        fecha_inicio:fecha_inicio.value,
        fecha_fin:fecha_fin.value
      }
      console.log("🚀 ~ file: App.vue ~ line 311 ~ buscar ~ dataSend", dataSend)
      
      lst_pagos.value=window.electron.getPagosConcepto(dataSend)

      console.log("🚀 ~ file: App.vue:297 ~ buscar ~ lst_pagos.value:", lst_pagos.value);


    }
    
    function imprimir(){
      let reporte=document.createElement('div');
      let titulo=document.createElement('h2')
      let periodo=document.createElement('div');
      let cajero=document.createElement('span');
      let table=document.createElement('table');
      let header=document.createElement('thead');
      let header_tr=document.createElement('tr');
      let tbody=document.createElement('tbody')
      let tfoot =document.createElement('tfoot')

      titulo.appendChild(document.createTextNode('Reporte de Corte Caja'))
      reporte.appendChild(titulo)
      titulo.style.textAlign="center"
      titulo.style.padding="0 0 0 0"
      titulo.style.margin="0 0 0 0"

      periodo.style.textAlign="center";
      periodo.style.marginBottom="5px"

      periodo.appendChild(document.createTextNode(`Perido del ${dayjs(fecha_inicio.value).format("DD/MM/YYYY")} al ${dayjs(fecha_fin.value).format("DD/MM/YYYY")} ,  Cajero(a): ${cajeroText.value}`))
     
      reporte.appendChild(periodo)
      
      let accion=document.createElement('th');
      accion.appendChild(document.createTextNode('Accion'))
      accion.style.border="1px solid #000"
      accion.style.borderCollapse='collapse'
      accion.style.padding="0 2px 0 2px"
      header_tr.appendChild(accion)

      header_tr.style.textAlign="center"
      header_tr.style.fontSize="14px"    

      let nombre=document.createElement('th');
      nombre.appendChild(document.createTextNode('Nombre'))
      nombre.style.border="1px solid #000"
      nombre.style.borderCollapse='collapse'
      nombre.style.padding="0 2px 0 2px"
      header_tr.appendChild(nombre)
      

      let cargo=document.createElement('th');
      cargo.appendChild(document.createTextNode('Cargo'))
      cargo.style.border="1px solid #000"
      cargo.style.borderCollapse='collapse'
      cargo.style.padding="0 2px 0 2px"
      header_tr.appendChild(cargo)

      let periodoh=document.createElement('th');
      periodoh.appendChild(document.createTextNode('Periodo'))
      periodoh.style.border="1px solid #000"
      periodoh.style.borderCollapse='collapse'
      periodoh.style.padding="0 2px 0 2px"
      header_tr.appendChild(periodoh)

      let fecha_cobro=document.createElement('th');
      fecha_cobro.appendChild(document.createTextNode('Fecha Cobro'))
      fecha_cobro.style.border="1px solid #000"
      fecha_cobro.style.borderCollapse='collapse'
      fecha_cobro.style.padding="0 2px 0 2px"
      header_tr.appendChild(fecha_cobro)

      let subtotal=document.createElement('th');
      subtotal.appendChild(document.createTextNode('Subtotal'))
      subtotal.style.border="1px solid #000"
      subtotal.style.borderCollapse='collapse'
      subtotal.style.padding="0 2px 0 2px"
      header_tr.appendChild(subtotal )

      let total=document.createElement('th');
      total.appendChild(document.createTextNode('Total'))
      total.style.border="1px solid #000"
      total.style.borderCollapse='collapse'
      total.style.padding="0 2px 0 2px"
      header_tr.appendChild(total)


      /// estilos
      table.style.width='100%'
      table.style.borderCollapse="collapse"
      header_tr.style.backgroundColor="#d1d1d1"
      header_tr.style.borderCollapse='collapse'

      header.appendChild(header_tr)
      
      table.appendChild(header)



      lst_pagos.value.forEach(item => 
        {
        let tr_body=document.createElement('tr')
        tr_body.style.textAlign="center"

        let accionTD=document.createElement('td')
        accionTD.style.fontSize="12px"
        accionTD.style.border="1px solid #000"
        accionTD.style.padding="0 2px 0 2px"
        accionTD.appendChild(document.createTextNode(item.accion))
        tr_body.appendChild(accionTD)

        let socioTD=document.createElement('td')
        socioTD.style.fontSize="12px"
        socioTD.style.border="1px solid #000"
        socioTD.style.padding="0 2px 0 2px"
        socioTD.appendChild(document.createTextNode(item.sociox))
        tr_body.appendChild(socioTD)

        let conceptoTD=document.createElement('td')
        conceptoTD.style.fontSize="12px"
        conceptoTD.style.border="1px solid #000"
        conceptoTD.style.padding="0 2px 0 2px"
        conceptoTD.appendChild(document.createTextNode(item.concepto))
        tr_body.appendChild(conceptoTD)
        
        let periodoTD=document.createElement('td')
        periodoTD.style.fontSize="12px"
        periodoTD.style.border="1px solid #000"
        periodoTD.style.padding="0 2px 0 2px"
        periodoTD.appendChild(document.createTextNode(item.periodo))
        tr_body.appendChild(periodoTD)

        let fechaTD=document.createElement('td')
        fechaTD.style.fontSize="12px"
        fechaTD.style.border="1px solid #000"
        fechaTD.style.padding="0 2px 0 2px"
        fechaTD.appendChild(document.createTextNode(dayjs(item.fecha_hora_cobro).format('DD/MM/YYYY')))
        tr_body.appendChild(fechaTD)

        let subtotalTD=document.createElement('td')
        subtotalTD.style.fontSize="12px"
        subtotalTD.style.border="1px solid #000"
        subtotalTD.style.padding="0 2px 0 2px"
        subtotalTD.appendChild(document.createTextNode(numeral(_.round(parseFloat((item.total-item.monto)/116*100),2)).format('0,0[.]00')))
        tr_body.appendChild(subtotalTD)

        let totalTD=document.createElement('td')
        totalTD.style.fontSize="12px"
        totalTD.style.border="1px solid #000"
        totalTD.style.padding="0 2px 0 2px"
        totalTD.appendChild(document.createTextNode(numeral(_.round(parseFloat(item.total-item.monto),2)).format('0,0[.]00')))
        tr_body.appendChild(totalTD)

        tbody.appendChild(tr_body)
        })

        let total_= numeral(
              lst_pagos.value
                .map(item => parseFloat(item.total*item.cantidad)-parseFloat(_.isNull(item.monto)?0:item.monto))
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00")

        let subtotal_= numeral(
              lst_pagos.value
                .map(item => (parseFloat(item.total*item.cantidad)-parseFloat(_.isNull(item.monto)?0:item.monto))/116*100)
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00")

      let tr_tfoot=document.createElement('tr')

      let th_foot=document.createElement('th')
      th_foot.colSpan=5
      let th_foot1=document.createElement('th')
      th_foot1.style.fontSize="14px"
      th_foot1.style.border="1px solid #000"
      th_foot1.style.padding="0 2px 0 2px"
      th_foot1.appendChild(document.createTextNode(subtotal_))

      let th_foot2=document.createElement('th')
      th_foot2.style.fontSize="14px"
      th_foot2.style.border="1px solid #000"
      th_foot2.style.padding="0 2px 0 2px"
      th_foot2.appendChild(document.createTextNode(total_))

      tr_tfoot.appendChild(th_foot)
      tr_tfoot.appendChild(th_foot1)
      tr_tfoot.appendChild(th_foot2)
      
      tfoot.appendChild(tr_tfoot)
      
      table.appendChild(tbody)
      table.appendChild(tfoot)

      reporte.appendChild(table)

      
      printJS({printable:reporte.innerHTML,type:'raw-html',style:'th:{background:#d1d1d1}'});
    }

    function exportar() {
      let wb = XLSX.utils.book_new();
      wb.SheetNames.push("pagos");
      let ws_data1 = lst_pagos.value.map(item => [
        item.accion,
        item.concepto,
        item.periodo,
        item.sociox,
        item.folio,
        parseFloat(item.total),
        parseFloat(
          _.isNull(item.monto) || _.isUndefined(item.monto) ? 0 : item.monto
        ),
        _.round(parseFloat(((item.total - item.monto) / 116) * 100), 2),
        _.round(parseFloat(((item.total - item.monto) / 116) * 100 * 0.16), 2),
        _.round(parseFloat(item.total - item.monto), 2),
        item.fecha_hora_cobro,
        item.cajerox
      ]);

      let ws_data = _.concat(
        [
          [
            "Accion",
            "Concepto",
            "Periodo",
            "Usuario",
            "Folio",
            "Cargo",
            "Descuento",
            "Subtotal",
            "Iva",
            "Total",
            "Fecha Pago",
            "Cajero(a)"
          ]
        ],
        ws_data1
      );

      console.log(ws_data);
      let ws = XLSX.utils.aoa_to_sheet(ws_data, { origin: "B2" });

      wb.Sheets["pagos"] = ws;

      let wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });

      function s2ab(s) {
        let buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
        let view = new Uint8Array(buf); //create uint8array as viewer
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff; //convert to octet
        return buf;
      }

      saveAs(
        new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
        "test.xlsx"
      );
    }

    function generar() {
      const pdf = new jsPDF();

      pdf.text("Reporte de Corte Caja", 100, 10, null, null, "center");
      pdf.setFontSize(10);
      pdf.text(`Perido del ${dayjs(fecha_inicio.value).format("DD/MM/YYYY")} al ${dayjs(fecha_fin.value).format("DD/MM/YYYY")} ,  Cajero(a): ${cajeroText.value}`, 100, 15, null, null, "center");
      let bandera = 0;
      pdf.autoTable({
        theme: "grid",
        margin: { left: 5, right: 5,top:20 },
        headStyles: { fillColor: [115, 115, 115], cellWidth: "wrap" },
        bodyStyles:{fontSize:8,overflow:'ellipsize'},
        footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        columnStyles: {
          total: { fillColor: [115, 115, 115], textColor: [255, 255, 255] }
        },
        columns: [  
          { header: "Accion", dataKey: "accion" },
          { header: "Nombre", dataKey: "sociox" },
          { header: "Cargo", dataKey: "concepto" },
          { header: "Periodo", dataKey: "periodo" },
          { header: "Fecha Cobro", dataKey: "fecha_hora_cobro" },
          
          // { header: "Folio", dataKey: "folio" },
          // { header: "Monto", dataKey: "monto" },
          // { header: "Descuento", dataKey: "descuento" },
          { header: "Subtotal", dataKey: "subtotal" },
          // { header: "Iva", dataKey: "iva" },
          { header: "Total", dataKey: "total" },
          
          // { header: "Cobro", dataKey: "cajerox" }
        ],
        body: lst_pagos.value.map(item => (
        {accion:item.accion,
        sociox:item.sociox,
        concepto:item.concepto,
        periodo:item.periodo,
        fecha_hora_cobro:dayjs(item.fecha_hora_cobro).format("DD/MM/YYYY"),
        
        // folio:item.folio,
        // total:numeral(parseFloat(item.total)).format('0,0[.]00'),
        // monto:numeral(parseFloat(_.isNull(item.monto)|| _.isUndefined(item.monto)?0:item.monto)).format('0,0[.]00'),
        subtotal:numeral(_.round(parseFloat((item.total-item.monto)/116*100),2)).format('0,0[.]00'),
        // iva:numeral(_.round(parseFloat(((item.total-item.monto)/116*100)*.16),2)).format('0,0[.]00'),
        total:numeral(_.round(parseFloat(item.total-item.monto),2)).format('0,0[.]00'),
        
        cajerox:item.cajerox,})),
        foot: [{
          total: numeral(
              lst_pagos.value
                .map(item => parseFloat(item.total*item.cantidad)-parseFloat(_.isNull(item.monto)?0:item.monto))
                //  .map(item =>  parseFloat(_.isNull(item.monto)?0:item.monto))
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00"),
            subtotal: numeral(
              lst_pagos.value
                .map(item => (parseFloat(item.total*item.cantidad)-parseFloat(_.isNull(item.monto)?0:item.monto))/116*100)
                .reduce((red, val) => red + parseFloat(val), 0)
            ).format("0,0[.]00"),
        }]
      });

      /*pdf.autoTable({
        theme: "grid",
        margin: { left: 5, right: 5 },
        headStyles: { fillColor: [115, 115, 115], cellWidth: "wrap" },
        footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        head:[{content: this.itemsFPSeleccionadas
              .map(
                item =>
                  `${item.forma_pago}:${numeral(item.monto).format("0,0")}`
              )
              .join(" | ")}]
      });*/

      pdf.save("reporte_pagos.pdf");
    }

 
  //   fIva(value) {
  //     return (parseFloat(value) / 116) * 100 * 0.16;
  //   }
  // }
  
    
  function close()
  {
    window.electron.closeReportePagos()
  }
  

  function minimizar()
  {
    window.electron.miniReportePagos()
  }

</script>

<style>
</style>