import React, {Component} from 'react';
import {
  Image,
  PixelRatio,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Dimensions 
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
// import resolveAssetSource from "react-native/Libraries/Image/resolveAssetSource";
import  { post } from 'axios';
import { RNPhotoEditor } from 'react-native-photo-editor';
import RNFS from 'react-native-fs'
// import RNFetchBlob from 'rn-fetch-blob'

export default class App extends Component {
  state = {
    avatarSource: null,
    visible:true,
    editedPath:null,
    output:'',
    count:0,
    text:'',
    newImagePath:''
  };

  constructor(props) {
    super(props);
    this.selectPhotoTapped = this.selectPhotoTapped.bind(this);
    //this.getPhoto = this.getPhoto.bind(this);
    this._onPress = this._onPress.bind(this);
	this.handleUploadPhoto = this.handleUploadPhoto.bind(this);
	// this.createFormData = this.createFormData.bind(this);
  }
	handleUploadPhoto(){
	  // fetch("http://localhost:3000/api/upload", {
		// method: "POST",
		// body: this.createFormData(this.state.avatarSource, { userId: "123" })
	  // })
		// .then(response => response.json())
		// .then(response => {
		//   console.log("upload succes", response);
		//   alert("Upload success!");
		//   this.setState({ avatarSource: null });
		// })
		// .catch(error => {
		//   console.log("upload error", error);
		//   alert(error);
    // });
    const url = 'https://microbialcolonycounter.herokuapp.com/submit';
    const formData = new FormData(); 
    formData.append('photo',{
      name: 'photo.jpg',
      type: 'image/jpeg',
      uri:this.state.editedPath
      })
      formData.append('date',Date.now())
    const config = {
        headers: {
            'content-type': 'multipart/form-data',
            'responseType': 'arraybuffer'
        }
    }
    post(url, formData,config)
    .then(response => {
      this.setState({
        text:'Respose Received',
        output: response.data.image,
        count:+response.data.colonycount.substring(7)
      })
      Alert.alert('colonies detected: '+(+response.data.colonycount.substring(7)));
      // this.setState({})
      // const imagePath = `${RNFS.TemporaryDirectoryPath}image.png`;
      // RNFS.writeFile(imagePath, response.data.image, 'base64')
      // .then(() => {
      //   Alert('Image converted to jpg and saved at ' + imagePath)
      //   this.setState({newImagePath:imagePath,visible:true})
      //   this._onPress(imagePath)
      // });
    })

	};
	
	// createFormData(photo, body){
	//   const data = new FormData();

	//   data.append("photo", {
	// 	name: photo.fileName,
	// 	type: photo.type,
	// 	uri:this.state.imagePath
	//   });

	//   Object.keys(body).forEach(key => {
	// 	data.append(key, body[key]);
	//   });

	//   return data;
	// };
	
  selectPhotoTapped() {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      storageOptions: {
        waitUntilSaved: true,
      },
    };

    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        let source = { uri: response.uri };

        // You can also display the image using data:
        // let source = { uri: 'data:image/jpeg;base64,' + response.data };

        this.setState({
          avatarSource: source,
        });
        //this.getPhoto(response)
        this._onPress(response.path)
      }
    });
  }

  _onPress(path) {
    if(this.state.visible){
      RNPhotoEditor.Edit({
        // path: RNFS.DocumentDirectoryPath + "/photo.jpg",
        path,
        stickers: [
          "circle1"
        ],
        hiddenControls: [],
        colors: undefined,
        onDone: (imagePath) => {
          console.log('on done: '+imagePath)
          this.setState({visible:false,editedPath:'file://'+imagePath})
          // Alert.alert(
          //   'on done: '+imagePath
          // )
		    this.handleUploadPhoto()
        },
        onCancel: () => {
          console.log('on cancel')
          this.setState({visible:false})
        //   Alert.alert(
        //     'on cancel'
        //  )
        }
      });
    }
    
  }

  // getPhoto(source) {
  //   let photoPath = RNFS.DocumentDirectoryPath + "/photo.jpg";
  //   let binaryFile = resolveAssetSource(RNFS.DocumentDirectoryPath + "/photo.jpg")

  //   RNFetchBlob.config({ fileCache: false })
  //     .fetch("GET", binaryFile.path)
  //     .then(resp => {
  //       RNFS.moveFile(resp.path(), photoPath)
  //         .then(success => {
  //           console.log("FILE WRITTEN!");
  //           this._onPress()
  //         })
  //         .catch(err => {
  //           console.log(err.message);
  //         });
  //     })
  //     .catch(err => {
  //       console.log(err.message);
  //     });
  // }

  render() {
    if(this.state.visible){
      return (
        <View style={styles.container}>
        <Text style={{fontSize:30,marginBottom:40,marginTop:-80}}> Microbial Colony Counter </Text>
        <TouchableOpacity onPress={this.selectPhotoTapped.bind(this)}>
            <View
              style={[
                styles.avatar,
                styles.avatarContainer,
                { marginBottom: 20 },
              ]}
            >
              {this.state.avatarSource === null ? (
                <Text>Select a Photo</Text>
              ) : (
                <View>
                  <Image style={styles.avatar} source={this.state.avatarSource} />
                  {/* <Text>{this.state.avatarSource.uri}</Text> */}
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      );
    }
    else if(this.state.output){
      let filePath = this.state.output
      let deviceWidth = Dimensions.get('window').width
      let deviceHeight = 0.8*Dimensions.get('window').height
      return (
        <View>
          <Text style={{textAlign:"center",fontSize:30}}>
            Output Image
          </Text>
          <Image style={{width:deviceWidth,height:deviceHeight}} source={{uri:filePath}} />
          <Text style={{textAlign:"center",fontSize:30}}>
            Colonies detected: {this.state.count}
          </Text>
        </View>
      )
    }
    else {
      let filePath = this.state.editedPath
      let deviceWidth = Dimensions.get('window').width
      let deviceHeight = 0.8*Dimensions.get('window').height

      return (
        <View>
          <Image style={{width:deviceWidth,height:deviceHeight}} source={{isStatic:true,uri:filePath}} />
        </View>
      )
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  avatarContainer: {
    borderColor: '#9B9B9B',
    borderWidth: 1 / PixelRatio.get(),
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    borderRadius: 75,
    width: 150,
    height: 150,
  },
});