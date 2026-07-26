//
// AUTO-GENERATED FILE, DO NOT MODIFY!
//

// ignore_for_file: unused_element
import 'package:built_value/built_value.dart';
import 'package:built_value/serializer.dart';

part 'issue_customer_check_in_link_command.g.dart';

/// IssueCustomerCheckInLinkCommand
///
/// Properties:
/// * [expectedVersion] 
@BuiltValue()
abstract class IssueCustomerCheckInLinkCommand implements Built<IssueCustomerCheckInLinkCommand, IssueCustomerCheckInLinkCommandBuilder> {
  @BuiltValueField(wireName: r'expectedVersion')
  int get expectedVersion;

  IssueCustomerCheckInLinkCommand._();

  factory IssueCustomerCheckInLinkCommand([void updates(IssueCustomerCheckInLinkCommandBuilder b)]) = _$IssueCustomerCheckInLinkCommand;

  @BuiltValueHook(initializeBuilder: true)
  static void _defaults(IssueCustomerCheckInLinkCommandBuilder b) => b;

  @BuiltValueSerializer(custom: true)
  static Serializer<IssueCustomerCheckInLinkCommand> get serializer => _$IssueCustomerCheckInLinkCommandSerializer();
}

class _$IssueCustomerCheckInLinkCommandSerializer implements PrimitiveSerializer<IssueCustomerCheckInLinkCommand> {
  @override
  final Iterable<Type> types = const [IssueCustomerCheckInLinkCommand, _$IssueCustomerCheckInLinkCommand];

  @override
  final String wireName = r'IssueCustomerCheckInLinkCommand';

  Iterable<Object?> _serializeProperties(
    Serializers serializers,
    IssueCustomerCheckInLinkCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) sync* {
    yield r'expectedVersion';
    yield serializers.serialize(
      object.expectedVersion,
      specifiedType: const FullType(int),
    );
  }

  @override
  Object serialize(
    Serializers serializers,
    IssueCustomerCheckInLinkCommand object, {
    FullType specifiedType = FullType.unspecified,
  }) {
    return _serializeProperties(serializers, object, specifiedType: specifiedType).toList();
  }

  void _deserializeProperties(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
    required List<Object?> serializedList,
    required IssueCustomerCheckInLinkCommandBuilder result,
    required List<Object?> unhandled,
  }) {
    for (var i = 0; i < serializedList.length; i += 2) {
      final key = serializedList[i] as String;
      final value = serializedList[i + 1];
      switch (key) {
        case r'expectedVersion':
          final valueDes = serializers.deserialize(
            value,
            specifiedType: const FullType(int),
          ) as int;
          result.expectedVersion = valueDes;
          break;
        default:
          unhandled.add(key);
          unhandled.add(value);
          break;
      }
    }
  }

  @override
  IssueCustomerCheckInLinkCommand deserialize(
    Serializers serializers,
    Object serialized, {
    FullType specifiedType = FullType.unspecified,
  }) {
    final result = IssueCustomerCheckInLinkCommandBuilder();
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

