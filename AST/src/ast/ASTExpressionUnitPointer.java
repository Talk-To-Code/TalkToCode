package ast;
/**
 * @author SOON WEI JUN A0156192A
 * This class is mainly in charge of construction of AST nodes that represents
 * a pointer 
 * and syntax generation of the respective term.
 * This is available in C only.
 */
public class ASTExpressionUnitPointer extends ASTExpressionUnit{
	private static final String NODE_TYPE = "Pointer";
	private ASTExpressionUnit name;
	public ASTExpressionUnitPointer() {
		super();
	}

	public ASTExpressionUnitPointer(ASTExpressionUnit name){
		this();
		this.name = name;
	}
	public ASTExpressionUnit getIdentifier() { return this.name; }
	public String toSyntax(){
		this.result = "*" + this.name.toSyntax();
		if(this.isQuoted) quote();
		return super.toSyntax();
	}
	public String typeof() {
		return super.typeof()+"->"+NODE_TYPE;
	}
}
