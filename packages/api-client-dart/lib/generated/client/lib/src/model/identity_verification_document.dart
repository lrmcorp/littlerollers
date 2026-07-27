//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_collection/built_collection.dart';
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_document.g.dart';

/// Object keys, checksums, provider references and view authorization tokens are never exposed.
///
/// Properties:
/// * [id] 
/// * [kind] 
/// * [status] 
/// * [uploadStatus] 
/// * [scanStatus] 
/// * [fileName] 
/// * [mimeType] 
/// * [sizeBytes] 
/// * [rejectionReasonCode] 
/// * [rejectionNote] 
/// * [reviewedAt] 
/// * [deletedAt] 
/// * [version] 
@BuiltValue()
abstract class IdentityVerificationDocument implements Built<IdentityVerificationDocument, IdentityVerificationDocumentBuilder> {
  @BuiltValueField(wireName: r'id')
  String get id;

  @BuiltValueField(wireName: r'kind')
  IdentityVerificationDocumentKindEnum get kind;
  // enum kindEnum {  SELFIE,  KTP_FRONT,  };

  @BuiltValueField(wireName: r'status')
  IdentityVerificationDocumentStatusEnum get status;
  // enum statusEnum {  PENDING,  APPROVED,  REJECTED,  PENDING_DELETION,  DELETE_FAILED,  DELETED,  };

  @BuiltValueField(wireName: r'uploadStatus')
  IdentityVerificationDocumentUploadStatusEnum get uploadStatus;
  // enum uploadStatusEnum {  ISSUED,  UPLOADED,  FINALIZED,  FAILED,  };

  @BuiltValueField(wireName: r'scanStatus')
  IdentityVerificationDocumentScanStatusEnum get scanStatus;
  // enum scanStatusEnum {  PENDING,  CLEAN,  REJECTED,  INFECTED,  ERROR,  };

  @BuiltValueField(wireName: r'fileName')
  String get fileName;

  @BuiltValueField(wireName: r'mimeType')
  String get mimeType;

  @BuiltValueField(wireName: r'sizeBytes')
  int get sizeBytes;

  @BuiltValueField(wireName: r'rejectionReasonCode')
  String? get rejectionReasonCode;

  @BuiltValueField(wireName: r'rejectionNote')
  String? get rejectionNote;

  @BuiltValueField(wireName: r'reviewedAt')
  DateTime? get reviewedAt;

  @BuiltValueField(wireName: r'deletedAt')
  DateTime? get deletedAt;

  @BuiltValueField(wireName: r'version')
  int get version;

  IdentityVerificationDocument._();

  factory IdentityVerificationDocument([void updates(IdentityVerificationDocumentBuilder b)]) = _$IdentityVerificationDocument;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationDocumentBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationDocument> get serializer => _$IdentityVerificationDocumentSerializer();
}

class _$IdentityVerificationDocumentSerializer implements PrimitiveSerializer<IdentityVerificationDocument> {
  @override
  final Iterable<Type> types = const [IdentityVerificationDocument, _$IdentityVerificationDocument];

  @override
  final String wireName = r'IdentityVerificationDocument';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationDocument object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'id';
    yield serializers.serialize(
      object.id,
      specifiedType: const FullType(String),
    );
    yield r'kind';
    yield serializers.serialize(
      object.kind,
      specifiedType: const FullType(IdentityVerificationDocumentKindEnum),
    );
    yield r'status';
    yield serializers.serialize(
      object.status,
      specifiedType: const FullType(IdentityVerificationDocumentStatusEnum),
    );
    yield r'uploadStatus';
    yield serializers.serialize(
      object.uploadStatus,
      specifiedType: const FullType(IdentityVerificationDocumentUploadStatusEnum),
    );
    yield r'scanStatus';
    yield serializers.serialize(
      object.scanStatus,
      specifiedType: const FullType(IdentityVerificationDocumentScanStatusEnum),
    );
    yield r'fileName';
    yield serializers.serialize(
      object.fileName,
      specifiedType: const FullType(String),
    );
    yield r'mimeType';
    yield serializers.serialize(
      object.mimeType,
      specifiedType: const FullType(String),
    );
    yield r'sizeBytes';
    yield serializers.serialize(
      object.sizeBytes,
      specifiedType: const FullType(int),
    );
    if (object.rejectionReasonCode != null) {
      yield r'rejectionReasonCode';
      yield serializers.serialize(
        object.rejectionReasonCode,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.rejectionNote != null) {
      yield r'rejectionNote';
      yield serializers.serialize(
        object.rejectionNote,
        specifiedType: const FullType.nullable(String),
      );
    }
    if (object.reviewedAt != null) {
      yield r'reviewedAt';
      yield serializers.serialize(
        object.reviewedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    if (object.deletedAt != null) {
      yield r'deletedAt';
      yield serializers.serialize(
        object.deletedAt,
        specifiedType: const FullType.nullable(DateTime),
      );
    }
    yield r'version';
    yield serializers.serialize(
      object.version,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationDocument object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationDocumentBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'id':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.id = valueDes;
          break;
        case r'kind':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationDocumentKindEnum),
          ) as IdentityVerificationDocumentKindEnum;
          result.kind = valueDes;
          break;
        case r'status':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationDocumentStatusEnum),
          ) as IdentityVerificationDocumentStatusEnum;
          result.status = valueDes;
          break;
        case r'uploadStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationDocumentUploadStatusEnum),
          ) as IdentityVerificationDocumentUploadStatusEnum;
          result.uploadStatus = valueDes;
          break;
        case r'scanStatus':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(IdentityVerificationDocumentScanStatusEnum),
          ) as IdentityVerificationDocumentScanStatusEnum;
          result.scanStatus = valueDes;
          break;
        case r'fileName':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.fileName = valueDes;
          break;
        case r'mimeType':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(String),
          ) as String;
          result.mimeType = valueDes;
          break;
        case r'sizeBytes':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.sizeBytes = valueDes;
          break;
        case r'rejectionReasonCode':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.rejectionReasonCode = valueDes;
          break;
        case r'rejectionNote':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(String),
          ) as String?;
          if (valueDes == null) continue;
          result.rejectionNote = valueDes;
          break;
        case r'reviewedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.reviewedAt = valueDes;
          break;
        case r'deletedAt':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType.nullable(DateTime),
          ) as DateTime?;
          if (valueDes == null) continue;
          result.deletedAt = valueDes;
          break;
        case r'version':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.version = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationDocument deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationDocumentBuilder();
    final serializedList = (serialized as Iterable<Object?>).toList();
    final unhandled = <Object?>[];
    _deserializeProperties(
      serializers,
      serialized,
      specifiedType: specifiedType,
      serializedList: serializedList,
      unhandled: unhandled,
      result: result,
    );
    return result.build();
  }
}

class IdentityVerificationDocumentKindEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'SELFIE')
  static const IdentityVerificationDocumentKindEnum SELFIE = _$identityVerificationDocumentKindEnum_SELFIE;
  @BuiltValueEnumConst(wireName: r'KTP_FRONT')
  static const IdentityVerificationDocumentKindEnum KTP_FRONT = _$identityVerificationDocumentKindEnum_KTP_FRONT;

  static Serializer<IdentityVerificationDocumentKindEnum> get serializer => _$identityVerificationDocumentKindEnumSerializer;

  const IdentityVerificationDocumentKindEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationDocumentKindEnum> get values => _$identityVerificationDocumentKindEnumValues;
  static IdentityVerificationDocumentKindEnum valueOf(String name) => _$identityVerificationDocumentKindEnumValueOf(name);
}

class IdentityVerificationDocumentStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const IdentityVerificationDocumentStatusEnum PENDING = _$identityVerificationDocumentStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'APPROVED')
  static const IdentityVerificationDocumentStatusEnum APPROVED = _$identityVerificationDocumentStatusEnum_APPROVED;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const IdentityVerificationDocumentStatusEnum REJECTED = _$identityVerificationDocumentStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'PENDING_DELETION')
  static const IdentityVerificationDocumentStatusEnum PENDING_DELETION = _$identityVerificationDocumentStatusEnum_PENDING_DELETION;
  @BuiltValueEnumConst(wireName: r'DELETE_FAILED')
  static const IdentityVerificationDocumentStatusEnum DELETE_FAILED = _$identityVerificationDocumentStatusEnum_DELETE_FAILED;
  @BuiltValueEnumConst(wireName: r'DELETED')
  static const IdentityVerificationDocumentStatusEnum DELETED = _$identityVerificationDocumentStatusEnum_DELETED;

  static Serializer<IdentityVerificationDocumentStatusEnum> get serializer => _$identityVerificationDocumentStatusEnumSerializer;

  const IdentityVerificationDocumentStatusEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationDocumentStatusEnum> get values => _$identityVerificationDocumentStatusEnumValues;
  static IdentityVerificationDocumentStatusEnum valueOf(String name) => _$identityVerificationDocumentStatusEnumValueOf(name);
}

class IdentityVerificationDocumentUploadStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'ISSUED')
  static const IdentityVerificationDocumentUploadStatusEnum ISSUED = _$identityVerificationDocumentUploadStatusEnum_ISSUED;
  @BuiltValueEnumConst(wireName: r'UPLOADED')
  static const IdentityVerificationDocumentUploadStatusEnum UPLOADED = _$identityVerificationDocumentUploadStatusEnum_UPLOADED;
  @BuiltValueEnumConst(wireName: r'FINALIZED')
  static const IdentityVerificationDocumentUploadStatusEnum FINALIZED = _$identityVerificationDocumentUploadStatusEnum_FINALIZED;
  @BuiltValueEnumConst(wireName: r'FAILED')
  static const IdentityVerificationDocumentUploadStatusEnum FAILED = _$identityVerificationDocumentUploadStatusEnum_FAILED;

  static Serializer<IdentityVerificationDocumentUploadStatusEnum> get serializer => _$identityVerificationDocumentUploadStatusEnumSerializer;

  const IdentityVerificationDocumentUploadStatusEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationDocumentUploadStatusEnum> get values => _$identityVerificationDocumentUploadStatusEnumValues;
  static IdentityVerificationDocumentUploadStatusEnum valueOf(String name) => _$identityVerificationDocumentUploadStatusEnumValueOf(name);
}

class IdentityVerificationDocumentScanStatusEnum extends EnumClass {

  @BuiltValueEnumConst(wireName: r'PENDING')
  static const IdentityVerificationDocumentScanStatusEnum PENDING = _$identityVerificationDocumentScanStatusEnum_PENDING;
  @BuiltValueEnumConst(wireName: r'CLEAN')
  static const IdentityVerificationDocumentScanStatusEnum CLEAN = _$identityVerificationDocumentScanStatusEnum_CLEAN;
  @BuiltValueEnumConst(wireName: r'REJECTED')
  static const IdentityVerificationDocumentScanStatusEnum REJECTED = _$identityVerificationDocumentScanStatusEnum_REJECTED;
  @BuiltValueEnumConst(wireName: r'INFECTED')
  static const IdentityVerificationDocumentScanStatusEnum INFECTED = _$identityVerificationDocumentScanStatusEnum_INFECTED;
  @BuiltValueEnumConst(wireName: r'ERROR')
  static const IdentityVerificationDocumentScanStatusEnum ERROR = _$identityVerificationDocumentScanStatusEnum_ERROR;

  static Serializer<IdentityVerificationDocumentScanStatusEnum> get serializer => _$identityVerificationDocumentScanStatusEnumSerializer;

  const IdentityVerificationDocumentScanStatusEnum._(String name): super(name);

  static BuiltSet<IdentityVerificationDocumentScanStatusEnum> get values => _$identityVerificationDocumentScanStatusEnumValues;
  static IdentityVerificationDocumentScanStatusEnum valueOf(String name) => _$identityVerificationDocumentScanStatusEnumValueOf(name);
}

