//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'identity_verification_review_summary.g.dart';

/// IdentityVerificationReviewSummary
///
/// Properties:
/// * [totalCustomers] 
/// * [totalDocuments] 
/// * [pendingDocuments] 
/// * [approvedDocuments] 
/// * [rejectedDocuments] 
/// * [deletionIssues] 
@BuiltValue()
abstract class IdentityVerificationReviewSummary implements Built<IdentityVerificationReviewSummary, IdentityVerificationReviewSummaryBuilder> {
  @BuiltValueField(wireName: r'totalCustomers')
  int get totalCustomers;

  @BuiltValueField(wireName: r'totalDocuments')
  int get totalDocuments;

  @BuiltValueField(wireName: r'pendingDocuments')
  int get pendingDocuments;

  @BuiltValueField(wireName: r'approvedDocuments')
  int get approvedDocuments;

  @BuiltValueField(wireName: r'rejectedDocuments')
  int get rejectedDocuments;

  @BuiltValueField(wireName: r'deletionIssues')
  int get deletionIssues;

  IdentityVerificationReviewSummary._();

  factory IdentityVerificationReviewSummary([void updates(IdentityVerificationReviewSummaryBuilder b)]) = _$IdentityVerificationReviewSummary;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IdentityVerificationReviewSummaryBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IdentityVerificationReviewSummary> get serializer => _$IdentityVerificationReviewSummarySerializer();
}

class _$IdentityVerificationReviewSummarySerializer implements PrimitiveSerializer<IdentityVerificationReviewSummary> {
  @override
  final Iterable<Type> types = const [IdentityVerificationReviewSummary, _$IdentityVerificationReviewSummary];

  @override
  final String wireName = r'IdentityVerificationReviewSummary';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IdentityVerificationReviewSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'totalCustomers';
    yield serializers.serialize(
      object.totalCustomers,
      specifiedType: const FullType(int),
    );
    yield r'totalDocuments';
    yield serializers.serialize(
      object.totalDocuments,
      specifiedType: const FullType(int),
    );
    yield r'pendingDocuments';
    yield serializers.serialize(
      object.pendingDocuments,
      specifiedType: const FullType(int),
    );
    yield r'approvedDocuments';
    yield serializers.serialize(
      object.approvedDocuments,
      specifiedType: const FullType(int),
    );
    yield r'rejectedDocuments';
    yield serializers.serialize(
      object.rejectedDocuments,
      specifiedType: const FullType(int),
    );
    yield r'deletionIssues';
    yield serializers.serialize(
      object.deletionIssues,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    IdentityVerificationReviewSummary object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IdentityVerificationReviewSummaryBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'totalCustomers':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalCustomers = valueDes;
          break;
        case r'totalDocuments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.totalDocuments = valueDes;
          break;
        case r'pendingDocuments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.pendingDocuments = valueDes;
          break;
        case r'approvedDocuments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.approvedDocuments = valueDes;
          break;
        case r'rejectedDocuments':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.rejectedDocuments = valueDes;
          break;
        case r'deletionIssues':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.deletionIssues = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IdentityVerificationReviewSummary deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IdentityVerificationReviewSummaryBuilder();
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

